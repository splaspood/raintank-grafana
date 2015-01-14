package models

import (
	"time"
)

type Token struct {
	Id        int64
	AccountId int64    `xorm:"not null unique(uix_account_id_name)"`
	Name      string   `xorm:"not null unique(uix_account_id_name)"`
	Token     string   `xorm:"UNIQUE NOT NULL"`
	Role      RoleType `xorm:"not null"`
	Created   time.Time
	Updated   time.Time
}

// ---------------------
// COMMANDS
type AddTokenCommand struct {
	Name      string   `json:"name" binding:"required"`
	Role      RoleType `json:"role" binding:"required"`
	AccountId int64    `json:"-"`
	Token     string   `json:"-"`
	Result    *Token   `json:"-"`
}

type UpdateTokenCommand struct {
	Id        int64    `json:"id"`
	Name      string   `json:"name"`
	AccountId int64    `json:"-"`
	Role      RoleType `json:"role"`
	Result    *Token   `json:"-"`
}

type DeleteTokenCommand struct {
	Id        int64  `json:"id"`
	AccountId int64  `json:"-"`
	Result    *Token `json:"-"`
}

// ----------------------
// QUERIES

type GetTokensQuery struct {
	AccountId int64
	Result    []*Token
}

type GetAccountByTokenQuery struct {
	Token  string
	Result *Account
}

// ------------------------
// DTO & Projections

type TokenDTO struct {
	Id    int64    `json:"id"`
	Name  string   `json:"name"`
	Token string   `json:"token"`
	Role  RoleType `json:"role"`
}
