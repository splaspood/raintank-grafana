package api

import (
	"net/http"
	"net/url"
	"testing"

	. "github.com/smartystreets/goconvey/convey"

	m "github.com/torkelo/grafana-pro/pkg/models"
)

func TestAccountDataAccess(t *testing.T) {

	Convey("When getting graphite datasource proxy", t, func() {
		ds := m.DataSource{Url: "htttp://graphite:8080", Type: m.DS_GRAPHITE}
		proxy := NewReverseProxy(&ds, "/render")

		requestUrl, _ := url.Parse("http://grafana.com/sub")
		req := http.Request{URL: requestUrl}

		proxy.Director(&req)

		Convey("Can translate request url and path", func() {
			So(req.URL.Host, ShouldEqual, "graphite:8080")
			So(req.URL.Path, ShouldEqual, "/render")
		})
	})

	Convey("When getting influxdb datasource proxy", t, func() {
		ds := m.DataSource{
			Type:     m.DS_INFLUXDB,
			Url:      "http://influxdb:8083",
			Database: "site",
			User:     "user",
			Password: "password",
		}

		proxy := NewReverseProxy(&ds, "")

		requestUrl, _ := url.Parse("http://grafana.com/sub")
		req := http.Request{URL: requestUrl}

		proxy.Director(&req)

		Convey("Should add db to url", func() {
			So(req.URL.Path, ShouldEqual, "/db/site/")
		})

		Convey("Should add username and password", func() {
			queryVals := req.URL.Query()
			So(queryVals["u"][0], ShouldEqual, "user")
			So(queryVals["p"][0], ShouldEqual, "password")
		})

	})

}
