\set user tankadmin 
\set password '\'tankadmin\''
\set database tank

\echo -------------------------------------
\echo Passwort fuer User :user = :password
\echo -------------------------------------

DROP DATABASE :database;
DROP USER :user ;

CREATE USER :user WITH PASSWORD :password;
CREATE DATABASE :database WITH OWNER :user;
\c :database :user

set client_min_messages = ERROR;
set client_encoding = 'LATIN1';

--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.0
-- Dumped by pg_dump version 9.6.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: game; Type: TABLE; Schema: public; Owner: tankadmin
--

CREATE TABLE game (
    gameid integer NOT NULL,
    landscape text NOT NULL,
    players integer NOT NULL,
    opengame boolean DEFAULT true NOT NULL,
    wind numeric(10,5) NOT NULL,
    shotsfired integer DEFAULT 0 NOT NULL
);


ALTER TABLE game OWNER TO tankadmin;

--
-- Name: game_gameid_seq; Type: SEQUENCE; Schema: public; Owner: tankadmin
--

CREATE SEQUENCE game_gameid_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE game_gameid_seq OWNER TO tankadmin;

--
-- Name: game_gameid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: tankadmin
--

ALTER SEQUENCE game_gameid_seq OWNED BY game.gameid;


--
-- Name: tankuser; Type: TABLE; Schema: public; Owner: tankadmin
--

CREATE TABLE tankuser (
    userid character varying(20) NOT NULL,
    tankposition integer NOT NULL,
    gameid integer NOT NULL,
    tankangle numeric(8,6) DEFAULT (random() * pi()) NOT NULL,
    tankcolor character varying(7) NOT NULL,
    tankdead boolean DEFAULT false NOT NULL,
    tankfired boolean NOT NULL,
    tankstrength numeric(10,5) NOT NULL
);


ALTER TABLE tankuser OWNER TO tankadmin;

--
-- Name: game gameid; Type: DEFAULT; Schema: public; Owner: tankadmin
--

ALTER TABLE ONLY game ALTER COLUMN gameid SET DEFAULT nextval('game_gameid_seq'::regclass);


--
-- Data for Name: game; Type: TABLE DATA; Schema: public; Owner: tankadmin
--

COPY game (gameid, landscape, players, opengame, wind, shotsfired) FROM stdin;
\.


--
-- Name: game_gameid_seq; Type: SEQUENCE SET; Schema: public; Owner: tankadmin
--

SELECT pg_catalog.setval('game_gameid_seq', 306, true);


--
-- Data for Name: tankuser; Type: TABLE DATA; Schema: public; Owner: tankadmin
--

COPY tankuser (userid, tankposition, gameid, tankangle, tankcolor, tankdead, tankfired, tankstrength) FROM stdin;
\.


--
-- Name: game game_pkey; Type: CONSTRAINT; Schema: public; Owner: tankadmin
--

ALTER TABLE ONLY game
    ADD CONSTRAINT game_pkey PRIMARY KEY (gameid);


--
-- Name: tankuser tankuser_pkey; Type: CONSTRAINT; Schema: public; Owner: tankadmin
--

ALTER TABLE ONLY tankuser
    ADD CONSTRAINT tankuser_pkey PRIMARY KEY (userid);


--
-- Name: tankuser fk_gameid; Type: FK CONSTRAINT; Schema: public; Owner: tankadmin
--

ALTER TABLE ONLY tankuser
    ADD CONSTRAINT fk_gameid FOREIGN KEY (gameid) REFERENCES game(gameid) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

