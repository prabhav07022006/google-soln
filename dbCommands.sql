create database testdb;

create table userlog(
email varchar(40) PRIMARY KEY,
passwd varchar(20));

create table userdata(
email varchar(20) PRIMARY KEY,
currMeds varchar(300),
currdiag varchar(500),
pastMeds varchar(700),
pastdiag varchar(1000));
