-- ============================================================
-- Goyenda — seed: the eight placeholder cases
--
-- Optional. Run AFTER 0001_cases.sql if you want the site to have content
-- before real cases are written. Every one of these is invented.
-- Idempotent: re-running skips slugs that already exist.
--
-- Not seeded on purpose (upload through /admin): thumbnails, gallery
-- images, case PDFs, solution PDFs.
-- ============================================================

insert into public.cases
  (slug, title, premise, description,
   price, difficulty_rank, position, published, featured,
   tags, solve_minutes, page_count)
values
  ('the-rainhouse-key', 'The Rainhouse Key',
   'A riverside guesthouse locked from the inside, one key on the table — and a guest who signed out three hours after he died.',
   'The Rainhouse takes six guests a night and keeps a register in ink. On the fourteenth, one signature appears twice — once at check-in, and once three hours after the doctor''s estimate of death. The key was on the table. The door was bolted from inside. Somebody wants you to believe the register.',
   250, 'rookie', 1, true, true,
   array['Locked room', 'Two suspects']::text[], 45, 18),
  ('seventeen-minutes', 'Seventeen Minutes',
   'The station''s reel runs seventeen minutes short on the night its late-show host walked out of the booth and never came back.',
   'Every night for nine years, the late show ran to the second. The night its host walked out mid-sentence, the station''s own tape came back seventeen minutes short, and nobody in the building admits to touching it. Start with who was awake. Then work out who wasn''t.',
   400, 'senior', 2, true, true,
   array['Missing person', 'Audio evidence']::text[], 90, 31),
  ('the-ashgate-recital', 'The Ashgate Recital',
   'Four musicians, one poisoned glass in the interval, and a printed programme that was quietly reset the morning of the concert.',
   'Four musicians shared a glass of water in the interval; one of them didn''t play the second half. The programme in your hands was reprinted that morning. The one that went to the printers the night before said something else. Find out what changed, and who needed it to.',
   600, 'master', 3, true, true,
   array['Poisoning', 'Five suspects']::text[], 150, 46),
  ('the-ledger-at-nolpur', 'The Ledger at Nolpur',
   'A jute merchant is found in his own strongroom with the books balanced to the paisa — except for one page written in a hand that isn''t his.',
   'The strongroom was locked, the accounts balanced to the paisa, and the merchant was inside with the door bolted. One page of the ledger is in a hand that isn''t his. It''s the neatest page in the book. Someone was careful — but careful about the wrong thing.',
   250, 'rookie', 4, true, false,
   array['Forgery', 'Three suspects']::text[], 50, 20),
  ('low-tide-at-charkhali', 'Low Tide at Charkhali',
   'A fisherman''s boat drifts back to the jetty with the nets still wet, the lamp still lit, and a second set of footprints in the silt.',
   'A boat drifts back to the jetty an hour before dawn: nets wet, lamp lit, nobody aboard. The tide tables say it left on the ebb. The silt says two people walked down to it. Only one set of prints comes back.',
   400, 'senior', 5, true, false,
   array['Drowning', 'Tide tables']::text[], 100, 34),
  ('the-night-porter', 'The Night Porter',
   'Every guest on the fourth floor swears they heard the lift at 2 a.m. The lift''s own log says it never left the ground.',
   'Six guests on the fourth floor heard the lift at two in the morning. The lift''s maintenance log — stamped, initialled, and kept in a locked drawer — says it never left the ground. Either six people are wrong about the same minute, or the log is. Decide which, and then decide why.',
   400, 'senior', 6, true, false,
   array['Hotel', 'Contradicting witnesses']::text[], 85, 29),
  ('the-orchid-house', 'The Orchid House',
   'A botanist dies among her plants in a greenhouse kept at exactly 28 degrees — and the thermometer says it was never opened.',
   'The greenhouse is kept at twenty-eight degrees and the door is alarmed. The botanist was found among her plants at dawn; the climate chart shows the temperature never moved. Nothing came in, nothing went out. And yet something did.',
   600, 'master', 7, true, false,
   array['Sealed room', 'Scientific evidence']::text[], 160, 48),
  ('a-wedding-in-shantinagar', 'A Wedding in Shantinagar',
   'Three hundred guests, one missing groom, and a wedding video that skips exactly where the family says nothing happened.',
   'Three hundred guests, four cameras, and a groom who is not in a single frame after the ninth course. The family''s video skips at 9:41 and again at 9:52 — the exact minutes they say nothing happened. Watch the edges of the frame. Somebody always is.',
   250, 'rookie', 8, true, false,
   array['Missing person', 'Video evidence']::text[], 40, 16)
on conflict (slug) do nothing;
