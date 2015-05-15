package alerting

import (
	"fmt"
	"net/http"

	"github.com/grafana/grafana/pkg/setting"

	"bosun.org/graphite"
)

type keysSeen struct {
	ts   int64
	seen map[string]struct{}
}

func NewKeysSeen(ts int64) *keysSeen {
	return &keysSeen{
		ts:   ts,
		seen: make(map[string]struct{}),
	}
}

type GraphiteReturner func(org_id int64) graphite.Context

func GraphiteAuthContextReturner(org_id int64) graphite.Context {
	return graphite.HostHeader{
		Host: setting.GraphiteUrl,
		Header: http.Header{
			"X-Org-Id": []string{fmt.Sprintf("%d", org_id)},
		}}
}

func Executor(fn GraphiteReturner) {
	var keysSeenLastSecond *keysSeen
	var keysSeenCurrentSecond *keysSeen

	for job := range jobQueue {
		fmt.Println("executor read job from queue", job)
		unix := job.ts.Unix()
		if keysSeenCurrentSecond != nil && unix == keysSeenCurrentSecond.ts {
			if _, ok := keysSeenCurrentSecond.seen[job.key]; ok {
				// already processed
				continue
			}
		}
		if keysSeenLastSecond != nil && unix == keysSeenLastSecond.ts {
			if _, ok := keysSeenLastSecond.seen[job.key]; ok {
				// already processed
				continue
			}
		}
		if keysSeenCurrentSecond == nil {
			keysSeenCurrentSecond = NewKeysSeen(unix)
		}
		if unix > keysSeenCurrentSecond.ts {
			keysSeenLastSecond = keysSeenCurrentSecond
			keysSeenCurrentSecond = NewKeysSeen(unix)
		}
		// skip old job if we've seen newer
		if (keysSeenLastSecond != nil && unix < keysSeenLastSecond.ts) || unix < keysSeenCurrentSecond.ts {
			continue
		}
		// note: if timestamp is very old (and we haven't processed anything newer),
		// we still process. better to be backlogged then not do jobs, up to operator to make system keep up
		// if timestamp is in future, we still process and assume that whoever created the job knows what they are doing.

		gr := fn(job.OrgId)

		evaluator, err := NewGraphiteCheckEvaluator(gr, job.Definition)
		if err != nil {
			// expressions should be validated before they are stored in the db
			// if they fail now it's a critical error
			panic(fmt.Sprintf("received invalid check definition '%s': %s", job.Definition, err))
		}

		res, err := evaluator.Eval(job.ts)
		fmt.Println(job, err, res)
		keysSeenCurrentSecond.seen[job.key] = struct{}{}

	}
}