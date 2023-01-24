// ==UserScript==
// @name         Blaseball Bet Stars
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Display teams stars on blaseball.com
// @author       You
// @match        https://blaseball.com/*
// @match        https://www.blaseball.com/*
// ==/UserScript==

const TEAM_MAP = {
  SHOE: "bfd38797-8404-4b38-8b82-341da28b1f83",
  TKO: "c73b705c-40ad-4633-a6ed-d357ee2e2bcf",
  YELL: "7966eb04-efcc-499b-8f03-d13916330531",
  STKS: "b024e975-1c4a-4575-8936-a3754a08806a",
  LOVE: "b72f3061-f573-40d7-832a-5ad475bd7909",
  CMT: "eb67ae5e-c4bf-46ca-bbbc-425cd34182ff",
  JAZZ: "a37f9158-7f82-46bc-908c-c9e2dda7c33b",
  DALE: "b63be8c2-576a-4d6e-8daf-814f8bcea96f",
  OHWO: "bb4a9de5-c924-4923-a0cb-9d1445f1ee5d",
  SPY: "9debc64f-74b7-4ae1-a4d6-fce0144b6ea5",
  PIES: "23e4cbc1-e9cd-47fa-a35b-bfa06f726cb7",
  TACO: "878c1bf6-0d21-4659-bfee-916c8314d69c",
  WAFC: "ca3f1c8c-c025-4d8e-8eef-5be6accbeb16",
  KCBM: "adc5b394-8f76-416d-9ce9-813706877b84",
  SEA: "105bc3ff-1320-4e37-8ef0-8d595cb95dd0",
  CDMX: "57ec08cc-0411-4643-b304-0e80dbc15ac7",
  TGRS: "747b8e4a-7e50-4638-a973-ea7950a3e739",
  MECH: "46358869-dce9-4a01-bfba-ac24fc56f57e",
  CRAB: "8d87c468-699a-47a8-b40d-cfb73a5660ad",
  ATL: "d9f89a8a-c563-493e-9d64-78e4f9a55d4a",
  SUN: "f02aeae2-5e6a-4098-9842-02d2273f25c7",
  FRI: "979aee4a-6d80-4863-bf1c-ee1a78e06024",
  BOS: "3f8bbb15-61c0-4e3f-8e4a-907a5fb1565e",
  NYM: "36569151-a2fb-43c1-9df7-2df512424c82",
};

const getTeamData = async () => {
  let json = {};
  try {
    const res = await fetch(
      "https://api2.sibr.dev/chronicler/v0/entities?kind=team"
    );
    json = await res.json();
  } catch (e) {
    console.warn(e);
  }
  return json.items;
};

const addTeamStats = async () => {
  const teamDataList = await getTeamData();

  Object.keys(TEAM_MAP).map(async (abbrev) => {
    const teamStats = teamDataList.find(
      (entry) => entry.entity_id === TEAM_MAP[abbrev]
    ).data.categoryRatings;
    const bets = document.querySelectorAll("div.bet-widget__info");
    const betsTeam = Array.from(bets).filter((entry) =>
      entry.innerHTML.includes(abbrev)
    );
    betsTeam.forEach((entry) => {
      const starGrid = document.createElement("div");
      starGrid.style.display = "grid";
      starGrid.style["grid-template-columns"] = "repeat(2, 1fr)";
      starGrid.style["column-gap"] = "8px";

      const batting = document.createElement("p");
      const battingScore = teamStats
        .find((stat) => stat.name === "batting")
        .stars.toFixed(3);
      batting.innerHTML = `Bat: ${battingScore}`;
      batting.classList.add("bet-widget__record");
      starGrid.append(batting);

      const defense = document.createElement("p");
      const defenseScore = teamStats
        .find((stat) => stat.name === "defense")
        .stars.toFixed(3);
      defense.innerHTML = `Def: ${defenseScore}`;
      defense.classList.add("bet-widget__record");
      starGrid.append(defense);

      const running = document.createElement("p");
      const runningScore = teamStats
        .find((stat) => stat.name === "running")
        .stars.toFixed(3);
      running.innerHTML = `Run: ${runningScore}`;
      running.classList.add("bet-widget__record");
      starGrid.append(running);

      const pitching = document.createElement("p");
      const pitchingScore = teamStats
        .find((stat) => stat.name === "pitching")
        .stars.toFixed(3);
      pitching.innerHTML = `Pch: ${pitchingScore}`;
      pitching.classList.add("bet-widget__record");
      starGrid.append(pitching);

      entry.append(starGrid);
    });
  });
};

const observePlayTab = new MutationObserver(async () => {
  const isBetPage = !!document.querySelector("section.hour");
  if (isBetPage) {
    addTeamStats();
  }
});

const observeMainContents = new MutationObserver(async () => {
  const isBetPage = !!document.querySelector("section.hour");
  if (isBetPage) {
    observeMainContents.disconnect();
    addTeamStats();
    observePlayTab.observe(document.querySelector(".playtab"), {
      childList: true,
    });
  }
});

observeMainContents.observe(
  document.querySelector(".main__contents") || document.body,
  { subtree: true, childList: true }
);
