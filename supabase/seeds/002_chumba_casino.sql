-- WagerLayer seed: Chumba Casino
-- Safe to rerun. Game providers and alternatives are intentionally omitted.

begin;

do $$
declare
  v_operator_id uuid;
  v_casino_id uuid;
begin
  select id into v_operator_id
  from public.operators
  where slug = 'vgw-games-limited'
  limit 1;

  if v_operator_id is null then
    insert into public.operators (name, slug, website_url)
    values ('VGW Games Limited', 'vgw-games-limited', 'https://www.vgw.co')
    returning id into v_operator_id;
  else
    update public.operators
    set name = 'VGW Games Limited', website_url = 'https://www.vgw.co'
    where id = v_operator_id;
  end if;

  select id into v_casino_id
  from public.casinos
  where slug = 'chumba-casino'
  limit 1;

  if v_casino_id is null then
    insert into public.casinos (
      operator_id, name, slug, website_url, affiliate_url, logo_url,
      established_year, min_age, trust_score, featured, status, last_verified_at
    )
    values (
      v_operator_id,
      'Chumba Casino',
      'chumba-casino',
      'https://www.chumbacasino.com',
      null,
      'https://kczlejvxxeglzcgjefja.supabase.co/storage/v1/object/public/casino-logos/chumba-logo.png',
      2012,
      21,
      6.5,
      true,
      'active',
      now()
    )
    returning id into v_casino_id;
  else
    update public.casinos
    set
      operator_id = v_operator_id,
      name = 'Chumba Casino',
      website_url = 'https://www.chumbacasino.com',
      logo_url = 'https://kczlejvxxeglzcgjefja.supabase.co/storage/v1/object/public/casino-logos/chumba-logo.png',
      established_year = 2012,
      min_age = 21,
      trust_score = 6.5,
      featured = true,
      status = 'active',
      last_verified_at = now()
    where id = v_casino_id;
  end if;

  update public.casino_content
  set
    verdict_label = 'Solid, Not Spotless',
    verdict_summary = 'Chumba is one of the most established sweepstakes casinos in the US, but its discretionary playthrough terms reduce transparency.',
    recommended_for = array[
      'Players who want one of the longest-running and most recognizable brands in the category',
      'Players sticking to smaller, straightforward redemptions',
      'Players with a mainstream US bank account',
      'Players who prefer simple daily rewards over a complex VIP ladder'
    ]::text[],
    not_ideal_for = array[
      'Players who want a very large game library',
      'Players in states where Sweeps Coins and prize redemption are restricted',
      'Players using online-only or non-traditional banks',
      'Players who want fully predictable playthrough and fee terms'
    ]::text[],
    last_verified_at = now()
  where casino_id = v_casino_id and section = 'should_you_play';

  if not found then
    insert into public.casino_content (
      casino_id, section, content, verdict_label, verdict_summary,
      recommended_for, not_ideal_for, last_verified_at
    )
values (
  v_casino_id,
  'should_you_play',
  'Chumba is one of the most established sweepstakes casinos in the US. Its long operating history is a strength, but discretionary playthrough terms reduce transparency.',
  'Solid, Not Spotless',
  'Chumba is one of the most established sweepstakes casinos in the US, but its discretionary playthrough terms reduce transparency.',
  array[
    'Players who want one of the longest-running and most recognizable brands in the category',
    'Players sticking to smaller, straightforward redemptions',
    'Players with a mainstream US bank account',
    'Players who prefer simple daily rewards over a complex VIP ladder'
  ]::text[],
  array[
    'Players who want a very large game library',
    'Players in states where Sweeps Coins and prize redemption are restricted',
    'Players using online-only or non-traditional banks',
    'Players who want fully predictable playthrough and fee terms'
  ]::text[],
  now()
);
  end if;

update public.bonuses
set
  name = 'Chumba Casino Signup Bonus',
  bonus_type = 'no_purchase_required',
  headline = '2,000,000 Gold Coins + 2 Sweeps Coins',
  description = 'No purchase necessary — free on signup.',
  purchase_amount = null,
  bonus_amount = 2,
  sweeps_coins = 2000000,
  promo_code = null,
  affiliate_url = null,
  terms_url = null,
  is_featured = true,
  sort_order = 1,
  status = 'active',
  starts_at = null,
  ends_at = null,
  last_verified_at = now()
where casino_id = v_casino_id
  and slug = 'chumba-casino-signup-bonus';

if not found then
  insert into public.bonuses (
    casino_id,
    name,
    slug,
    bonus_type,
    headline,
    description,
    purchase_amount,
    bonus_amount,
    sweeps_coins,
    promo_code,
    affiliate_url,
    terms_url,
    is_featured,
    sort_order,
    status,
    starts_at,
    ends_at,
    last_verified_at
  )
  values (
    v_casino_id,
    'Chumba Casino Signup Bonus',
    'chumba-casino-signup-bonus',
    'no_purchase_required',
    '2,000,000 Gold Coins + 2 Sweeps Coins',
    'No purchase necessary — free on signup.',
    null,
    2,
    2000000,
    null,
    null,
    null,
    true,
    1,
    'active',
    null,
    null,
    now()
  );
end if;

  insert into public.payment_methods (name, slug, category)
  values
    ('Visa', 'visa', 'card'),
    ('Mastercard', 'mastercard', 'card'),
    ('American Express', 'american-express', 'card'),
    ('Discover', 'discover', 'card'),
    ('Skrill', 'skrill', 'wallet'),
    ('Trustly', 'trustly', 'bank'),
    ('Paysafecard', 'paysafecard', 'other'),
    ('Chumba Prepaid Mastercard', 'chumba-prepaid-mastercard', 'card')
  on conflict (slug) do update
  set name = excluded.name, category = excluded.category;

  insert into public.casino_payment_methods (
    casino_id, payment_method_id, supports_purchase,
    supports_redemption, notes, last_verified_at
  )
  select
    v_casino_id,
    pm.id,
    true,
    false,
    case
      when pm.slug = 'trustly' then 'Online bank transfer purchase option.'
      when pm.slug = 'chumba-prepaid-mastercard' then 'Chumba-branded prepaid Mastercard option.'
      else null
    end,
    now()
  from public.payment_methods pm
  where pm.slug in (
    'visa','mastercard','american-express','discover',
    'skrill','trustly','paysafecard','chumba-prepaid-mastercard'
  )
  on conflict (casino_id, payment_method_id) do update
  set
    supports_purchase = excluded.supports_purchase,
    supports_redemption = excluded.supports_redemption,
    notes = excluded.notes,
    last_verified_at = excluded.last_verified_at;

  insert into public.casino_states (
    casino_id, state_id, availability, last_verified_at
  )
  select
    v_casino_id,
    s.id,
    case
      when s.code in ('CT','DE','MI','MT','NV','WA') then 'unavailable'
      when s.code in ('CA','ID','LA','MS','NJ','NY','TN','WV') then 'restricted'
      else 'available'
    end,
    now()
  from public.states s
  on conflict (casino_id, state_id) do update
  set
    availability = excluded.availability,
    last_verified_at = excluded.last_verified_at;

  update public.casino_vip_programs
  set
    program_name = 'Winner''s Circle',
    summary = 'Chumba does not publish a traditional tiered VIP ladder. Its Winner''s Circle recognizes active players and may include a personal account manager and priority support.',
    has_vip_program = false,
    is_public = false,
    tier_count = 0,
    eligibility = 'No public tier thresholds are published; recognition is based on account activity.',
    benefits = array[
      'Daily login rewards',
      'Potential personal account manager',
      'Potential priority support'
    ]::text[],
    notes = 'Winner''s Circle should not be presented as a conventional public tiered VIP program.',
    last_verified_at = now()
  where casino_id = v_casino_id;

  if not found then
    insert into public.casino_vip_programs (
      casino_id, program_name, summary, has_vip_program, is_public,
      tier_count, eligibility, benefits, notes, last_verified_at
    )
    values (
      v_casino_id,
      'Winner''s Circle',
      'Chumba does not publish a traditional tiered VIP ladder. Its Winner''s Circle recognizes active players and may include a personal account manager and priority support.',
      false,
      false,
      0,
      'No public tier thresholds are published; recognition is based on account activity.',
      array[
        'Daily login rewards',
        'Potential personal account manager',
        'Potential priority support'
      ]::text[],
      'Winner''s Circle should not be presented as a conventional public tiered VIP program.',
      now()
    );
  end if;

  update public.casino_trust_profiles
  set
    summary = 'Chumba has one of the longest operating histories in the sweepstakes casino category, but discretionary playthrough language and unclear potential fees weaken transparency.',
    ownership_notes = 'Operated by VGW Games Limited, part of VGW Holdings Limited.',
    account_security = 'Account controls and identity checks are used before eligible prize redemptions.',
    identity_verification = 'Players may be required to provide identity, address and source-of-funds documentation before or during redemption review.',
    responsible_play = 'Self-exclusion and account-limit tools are available.',
    terms_transparency = 'The terms allow Chumba to apply higher playthrough requirements in some circumstances, and potential redemption fees are not presented as a simple fixed schedule.',
    positive_signals = array[
      'Operating history dating to 2012',
      'Recognizable and established sweepstakes casino brand',
      'Long track record of processing eligible prize redemptions',
      'Standard identity-verification controls'
    ]::text[],
    watch_items = array[
      'Discretionary playthrough language',
      'Potential redemption fees are not clearly standardized',
      'Smaller game library than several newer competitors',
      'Some banks may flag payment processing'
    ]::text[],
    last_verified_at = now()
  where casino_id = v_casino_id;

  if not found then
    insert into public.casino_trust_profiles (
      casino_id, summary, ownership_notes, account_security,
      identity_verification, responsible_play, terms_transparency,
      positive_signals, watch_items, last_verified_at
    )
    values (
      v_casino_id,
      'Chumba has one of the longest operating histories in the sweepstakes casino category, but discretionary playthrough language and unclear potential fees weaken transparency.',
      'Operated by VGW Games Limited, part of VGW Holdings Limited.',
      'Account controls and identity checks are used before eligible prize redemptions.',
      'Players may be required to provide identity, address and source-of-funds documentation before or during redemption review.',
      'Self-exclusion and account-limit tools are available.',
      'The terms allow Chumba to apply higher playthrough requirements in some circumstances, and potential redemption fees are not presented as a simple fixed schedule.',
      array[
        'Operating history dating to 2012',
        'Recognizable and established sweepstakes casino brand',
        'Long track record of processing eligible prize redemptions',
        'Standard identity-verification controls'
      ]::text[],
      array[
        'Discretionary playthrough language',
        'Potential redemption fees are not clearly standardized',
        'Smaller game library than several newer competitors',
        'Some banks may flag payment processing'
      ]::text[],
      now()
    );
  end if;

  update public.casino_reviews
  set
    introduction = 'Chumba Casino has operated since 2012, making it one of the oldest and most recognizable brands in the sweepstakes casino category.',
    experience = 'The product uses a straightforward dual-currency model and focuses on simple daily engagement rather than a complex loyalty ladder. It is easy to understand, although the game catalog is smaller than those of several newer competitors.',
    games_overview = 'Chumba offers a comparatively compact game library. Provider information is being left unlisted until it can be verified directly, rather than relying on conflicting third-party provider lists.',
    bonuses_overview = 'The signup offer includes free Gold Coins and Sweeps Coins without requiring a purchase. The advertised 1x playthrough is competitive, but the terms permit higher requirements in some circumstances.',
    purchase_redemption_overview = 'Major card networks, Skrill, Trustly and several other purchase options are supported. Eligible redemptions require verification, and players should check current processing times, minimums and any applicable fees before redeeming.',
    trust_overview = 'Chumba benefits from a long operating history and a recognizable operator. Its main weakness is terms transparency, particularly discretionary playthrough language and the lack of a simple published fee schedule.',
    final_verdict = 'Chumba is a reasonable choice for players who value an established brand and a simple rewards loop. Players prioritizing the largest game library or the clearest possible terms will find stronger alternatives.',
    pros = array[
      'Established brand operating since 2012',
      'No-purchase signup offer',
      'Broad purchase-method support',
      'Simple daily rewards experience'
    ]::text[],
    cons = array[
      'Smaller game library than many newer competitors',
      'Discretionary playthrough language',
      'No conventional public tiered VIP program',
      'Restricted Sweeps Coins access in several states'
    ]::text[],
    last_verified_at = now()
  where casino_id = v_casino_id;

  if not found then
    insert into public.casino_reviews (
      casino_id, introduction, experience, games_overview,
      bonuses_overview, purchase_redemption_overview, trust_overview,
      final_verdict, pros, cons, last_verified_at
    )
    values (
      v_casino_id,
      'Chumba Casino has operated since 2012, making it one of the oldest and most recognizable brands in the sweepstakes casino category.',
      'The product uses a straightforward dual-currency model and focuses on simple daily engagement rather than a complex loyalty ladder. It is easy to understand, although the game catalog is smaller than those of several newer competitors.',
      'Chumba offers a comparatively compact game library. Provider information is being left unlisted until it can be verified directly, rather than relying on conflicting third-party provider lists.',
      'The signup offer includes free Gold Coins and Sweeps Coins without requiring a purchase. The advertised 1x playthrough is competitive, but the terms permit higher requirements in some circumstances.',
      'Major card networks, Skrill, Trustly and several other purchase options are supported. Eligible redemptions require verification, and players should check current processing times, minimums and any applicable fees before redeeming.',
      'Chumba benefits from a long operating history and a recognizable operator. Its main weakness is terms transparency, particularly discretionary playthrough language and the lack of a simple published fee schedule.',
      'Chumba is a reasonable choice for players who value an established brand and a simple rewards loop. Players prioritizing the largest game library or the clearest possible terms will find stronger alternatives.',
      array[
        'Established brand operating since 2012',
        'No-purchase signup offer',
        'Broad purchase-method support',
        'Simple daily rewards experience'
      ]::text[],
      array[
        'Smaller game library than many newer competitors',
        'Discretionary playthrough language',
        'No conventional public tiered VIP program',
        'Restricted Sweeps Coins access in several states'
      ]::text[],
      now()
    );
  end if;

  delete from public.casino_faqs where casino_id = v_casino_id;

  insert into public.casino_faqs (
    casino_id, question, answer_type, answer_key,
    manual_answer, sort_order, status, last_verified_at
  )
  values
    (v_casino_id, 'How old do you have to be to play at Chumba Casino?', 'structured', 'minimum_age', null, 1, 'active', now()),
    (v_casino_id, 'Is Chumba Casino available in my state?', 'structured', 'available_states', null, 2, 'active', now()),
    (v_casino_id, 'Which states restrict Chumba Casino?', 'structured', 'restricted_states', null, 3, 'active', now()),
    (v_casino_id, 'What purchase methods does Chumba Casino accept?', 'structured', 'purchase_methods', null, 4, 'active', now()),
    (v_casino_id, 'How can prizes be redeemed at Chumba Casino?', 'structured', 'redemption_methods', null, 5, 'active', now()),
    (v_casino_id, 'What is the minimum redemption at Chumba Casino?', 'structured', 'minimum_redemption', null, 6, 'active', now()),
    (v_casino_id, 'Who operates Chumba Casino?', 'structured', 'operator', null, 7, 'active', now()),
    (v_casino_id, 'Does Chumba Casino offer a welcome bonus?', 'structured', 'current_bonus', null, 8, 'active', now()),
    (
      v_casino_id,
      'Is Chumba Casino a real-money casino?',
      'manual',
      null,
      'No. Chumba Casino operates as a sweepstakes/social casino rather than a traditional real-money online casino. Gold Coins have no cash value, while eligible Sweeps Coins may be redeemed for prizes after applicable playthrough and verification requirements are met.',
      9,
      'active',
      now()
    );
end
$$;

commit;