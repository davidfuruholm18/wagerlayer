-- ============================================================
-- WagerLayer initial database schema
-- ============================================================

-- Required for UUID generation
create extension if not exists pgcrypto with schema extensions;

-- ============================================================
-- Shared updated_at trigger
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- Operators
-- Companies that own or operate casino brands
-- ============================================================

create table public.operators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint operators_name_not_blank
    check (char_length(trim(name)) > 0),

  constraint operators_slug_not_blank
    check (char_length(trim(slug)) > 0)
);

create trigger operators_set_updated_at
before update on public.operators
for each row
execute function public.set_updated_at();

-- ============================================================
-- Casinos
-- Central record for each sweepstakes casino
-- ============================================================

create table public.casinos (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid references public.operators(id) on delete set null,
  name text not null,
  slug text not null unique,
  logo_url text,
  website_url text,
  affiliate_url text,
  established_year smallint,
  min_age smallint not null default 18,
  trust_score numeric(3,1),
  featured boolean not null default false,
  status text not null default 'draft',
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint casinos_name_not_blank
    check (char_length(trim(name)) > 0),

  constraint casinos_slug_not_blank
    check (char_length(trim(slug)) > 0),

  constraint casinos_established_year_check
    check (
      established_year is null
      or established_year between 1900 and 2100
    ),

  constraint casinos_min_age_check
    check (min_age between 18 and 21),

  constraint casinos_trust_score_check
    check (
      trust_score is null
      or trust_score between 0 and 10
    ),

  constraint casinos_status_check
    check (status in ('draft', 'active', 'inactive'))
);

create index casinos_operator_id_idx
on public.casinos(operator_id);

create index casinos_status_idx
on public.casinos(status);

create index casinos_featured_idx
on public.casinos(featured)
where featured = true;

create trigger casinos_set_updated_at
before update on public.casinos
for each row
execute function public.set_updated_at();

-- ============================================================
-- States
-- US states and jurisdictions
-- ============================================================

create table public.states (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  slug text not null unique,
  status text not null default 'unclear',
  legal_summary text,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint states_name_not_blank
    check (char_length(trim(name)) > 0),

  constraint states_slug_not_blank
    check (char_length(trim(slug)) > 0),

  constraint states_code_check
    check (
      char_length(code) = 2
      and code = upper(code)
    ),

  constraint states_status_check
    check (status in ('allowed', 'restricted', 'unclear'))
);

create index states_status_idx
on public.states(status);

create trigger states_set_updated_at
before update on public.states
for each row
execute function public.set_updated_at();

-- ============================================================
-- Casino states
-- Availability of each casino in each state
-- ============================================================

create table public.casino_states (
  casino_id uuid not null
    references public.casinos(id) on delete cascade,

  state_id uuid not null
    references public.states(id) on delete cascade,

  availability text not null default 'unclear',
  notes text,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (casino_id, state_id),

  constraint casino_states_availability_check
    check (
      availability in (
        'available',
        'unavailable',
        'restricted',
        'unclear'
      )
    )
);

create index casino_states_state_id_idx
on public.casino_states(state_id);

create index casino_states_availability_idx
on public.casino_states(availability);

create trigger casino_states_set_updated_at
before update on public.casino_states
for each row
execute function public.set_updated_at();

-- ============================================================
-- Bonuses
-- Casino offers and promotions
-- ============================================================

create table public.bonuses (
  id uuid primary key default gen_random_uuid(),

  casino_id uuid not null
    references public.casinos(id) on delete cascade,

  name text not null,
  slug text not null,
  bonus_type text not null default 'other',
  headline text not null,
  description text,
  purchase_amount numeric(12,2),
  bonus_amount numeric(12,2),
  sweeps_coins numeric(12,2),
  promo_code text,
  affiliate_url text,
  terms_url text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  status text not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint bonuses_casino_slug_unique
    unique (casino_id, slug),

  constraint bonuses_name_not_blank
    check (char_length(trim(name)) > 0),

  constraint bonuses_slug_not_blank
    check (char_length(trim(slug)) > 0),

  constraint bonuses_headline_not_blank
    check (char_length(trim(headline)) > 0),

  constraint bonuses_type_check
    check (
      bonus_type in (
        'welcome',
        'purchase',
        'daily',
        'promo',
        'no_purchase_required',
        'other'
      )
    ),

  constraint bonuses_status_check
    check (status in ('draft', 'active', 'expired')),

  constraint bonuses_purchase_amount_check
    check (
      purchase_amount is null
      or purchase_amount >= 0
    ),

  constraint bonuses_bonus_amount_check
    check (
      bonus_amount is null
      or bonus_amount >= 0
    ),

  constraint bonuses_sweeps_coins_check
    check (
      sweeps_coins is null
      or sweeps_coins >= 0
    ),

  constraint bonuses_sort_order_check
    check (sort_order >= 0),

  constraint bonuses_date_range_check
    check (
      starts_at is null
      or ends_at is null
      or ends_at >= starts_at
    )
);

create index bonuses_casino_id_idx
on public.bonuses(casino_id);

create index bonuses_status_idx
on public.bonuses(status);

create index bonuses_active_casino_sort_idx
on public.bonuses(casino_id, sort_order)
where status = 'active';

create index bonuses_featured_idx
on public.bonuses(is_featured)
where is_featured = true;

create trigger bonuses_set_updated_at
before update on public.bonuses
for each row
execute function public.set_updated_at();

-- ============================================================
-- Payment methods
-- Master list of supported financial methods
-- ============================================================

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text not null default 'other',
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint payment_methods_name_not_blank
    check (char_length(trim(name)) > 0),

  constraint payment_methods_slug_not_blank
    check (char_length(trim(slug)) > 0),

  constraint payment_methods_category_check
    check (
      category in (
        'card',
        'bank',
        'wallet',
        'crypto',
        'other'
      )
    )
);

create index payment_methods_category_idx
on public.payment_methods(category);

create trigger payment_methods_set_updated_at
before update on public.payment_methods
for each row
execute function public.set_updated_at();

-- ============================================================
-- Casino payment methods
-- Purchase and redemption details by casino
-- ============================================================

create table public.casino_payment_methods (
  casino_id uuid not null
    references public.casinos(id) on delete cascade,

  payment_method_id uuid not null
    references public.payment_methods(id) on delete cascade,

  supports_purchase boolean not null default false,
  supports_redemption boolean not null default false,
  minimum_purchase numeric(12,2),
  maximum_purchase numeric(12,2),
  minimum_redemption numeric(12,2),
  processing_time text,
  fees text,
  notes text,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (casino_id, payment_method_id),

  constraint casino_payment_methods_usage_check
    check (
      supports_purchase = true
      or supports_redemption = true
    ),

  constraint casino_payment_methods_min_purchase_check
    check (
      minimum_purchase is null
      or minimum_purchase >= 0
    ),

  constraint casino_payment_methods_max_purchase_check
    check (
      maximum_purchase is null
      or maximum_purchase >= 0
    ),

  constraint casino_payment_methods_min_redemption_check
    check (
      minimum_redemption is null
      or minimum_redemption >= 0
    ),

  constraint casino_payment_methods_purchase_range_check
    check (
      minimum_purchase is null
      or maximum_purchase is null
      or maximum_purchase >= minimum_purchase
    )
);

create index casino_payment_methods_method_id_idx
on public.casino_payment_methods(payment_method_id);

create index casino_payment_methods_purchase_idx
on public.casino_payment_methods(casino_id)
where supports_purchase = true;

create index casino_payment_methods_redemption_idx
on public.casino_payment_methods(casino_id)
where supports_redemption = true;

create trigger casino_payment_methods_set_updated_at
before update on public.casino_payment_methods
for each row
execute function public.set_updated_at();

-- ============================================================
-- Game providers
-- Master list of software and game providers
-- ============================================================

create table public.game_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint game_providers_name_not_blank
    check (char_length(trim(name)) > 0),

  constraint game_providers_slug_not_blank
    check (char_length(trim(slug)) > 0)
);

create trigger game_providers_set_updated_at
before update on public.game_providers
for each row
execute function public.set_updated_at();

-- ============================================================
-- Casino providers
-- Providers available at each casino
-- ============================================================

create table public.casino_providers (
  casino_id uuid not null
    references public.casinos(id) on delete cascade,

  provider_id uuid not null
    references public.game_providers(id) on delete cascade,

  is_featured boolean not null default false,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  primary key (casino_id, provider_id)
);

create index casino_providers_provider_id_idx
on public.casino_providers(provider_id);

create index casino_providers_featured_idx
on public.casino_providers(casino_id)
where is_featured = true;

create trigger casino_providers_set_updated_at
before update on public.casino_providers
for each row
execute function public.set_updated_at();

-- ============================================================
-- Casino alternatives
-- Recommended alternative casinos for a given casino
-- Powers casino page alternatives, dynamic comparisons,
-- internal linking, affiliate recommendations, ranking logic
-- ============================================================

create table public.casino_alternatives (
  casino_id uuid not null
    references public.casinos(id) on delete cascade,

  alternative_casino_id uuid not null
    references public.casinos(id) on delete cascade,

  position smallint not null default 1,

  primary key (casino_id, alternative_casino_id),

  constraint casino_alternatives_not_self
    check (casino_id <> alternative_casino_id),

  constraint casino_alternatives_position_check
    check (position > 0)
);

create index casino_alternatives_alternative_casino_id_idx
on public.casino_alternatives(alternative_casino_id);

-- ============================================================
-- Articles
-- SEO guides and editorial content
-- ============================================================

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  featured_image_url text,
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint articles_title_not_blank
    check (char_length(trim(title)) > 0),

  constraint articles_slug_not_blank
    check (char_length(trim(slug)) > 0),

  constraint articles_content_not_blank
    check (char_length(trim(content)) > 0),

  constraint articles_status_check
    check (status in ('draft', 'published', 'archived')),

  constraint articles_published_at_check
    check (
      status <> 'published'
      or published_at is not null
    )
);

create index articles_status_idx
on public.articles(status);

create index articles_published_at_idx
on public.articles(published_at desc)
where status = 'published';

create trigger articles_set_updated_at
before update on public.articles
for each row
execute function public.set_updated_at();

-- ============================================================
-- Casino content
-- Long-form sections shown on individual casino pages
-- ============================================================

create table public.casino_content (
  id uuid primary key default gen_random_uuid(),

  casino_id uuid not null
    references public.casinos(id) on delete cascade,

  section text not null,
  title text,
  content text not null,
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint casino_content_casino_section_unique
    unique (casino_id, section),

  constraint casino_content_section_check
    check (
      section in (
        'should_you_play',
        'purchase_methods',
        'redemption',
        'vip',
        'trust',
        'full_review',
        'faq'
      )
    ),

  constraint casino_content_content_not_blank
    check (char_length(trim(content)) > 0)
);

create index casino_content_casino_id_idx
on public.casino_content(casino_id);

create trigger casino_content_set_updated_at
before update on public.casino_content
for each row
execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- Public users may read published product data.
-- Database changes remain restricted to trusted backend access.
-- ============================================================

alter table public.operators enable row level security;
alter table public.casinos enable row level security;
alter table public.states enable row level security;
alter table public.casino_states enable row level security;
alter table public.bonuses enable row level security;
alter table public.payment_methods enable row level security;
alter table public.casino_payment_methods enable row level security;
alter table public.game_providers enable row level security;
alter table public.casino_providers enable row level security;
alter table public.casino_alternatives enable row level security;
alter table public.articles enable row level security;
alter table public.casino_content enable row level security;

-- Operators are public because active casino pages may display them
create policy "Public can read operators"
on public.operators
for select
to anon, authenticated
using (true);

-- Only active casinos are publicly visible
create policy "Public can read active casinos"
on public.casinos
for select
to anon, authenticated
using (status = 'active');

-- State information is public
create policy "Public can read states"
on public.states
for select
to anon, authenticated
using (true);

-- Availability is public only when its casino is active
create policy "Public can read active casino states"
on public.casino_states
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.casinos
    where casinos.id = casino_states.casino_id
      and casinos.status = 'active'
  )
);

-- Only active bonuses belonging to active casinos are public
create policy "Public can read active bonuses"
on public.bonuses
for select
to anon, authenticated
using (
  status = 'active'
  and exists (
    select 1
    from public.casinos
    where casinos.id = bonuses.casino_id
      and casinos.status = 'active'
  )
);

-- Payment method reference data is public
create policy "Public can read payment methods"
on public.payment_methods
for select
to anon, authenticated
using (true);

-- Casino payment details are public only for active casinos
create policy "Public can read active casino payment methods"
on public.casino_payment_methods
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.casinos
    where casinos.id = casino_payment_methods.casino_id
      and casinos.status = 'active'
  )
);

-- Provider reference data is public
create policy "Public can read game providers"
on public.game_providers
for select
to anon, authenticated
using (true);

-- Casino-provider relationships are public only for active casinos
create policy "Public can read active casino providers"
on public.casino_providers
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.casinos
    where casinos.id = casino_providers.casino_id
      and casinos.status = 'active'
  )
);

-- Casino alternatives are public only when the source casino is active
create policy "Public can read active casino alternatives"
on public.casino_alternatives
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.casinos
    where casinos.id = casino_alternatives.casino_id
      and casinos.status = 'active'
  )
);

-- Only published articles are public
create policy "Public can read published articles"
on public.articles
for select
to anon, authenticated
using (
  status = 'published'
  and published_at <= now()
);

-- Casino content is public only for active casinos
create policy "Public can read active casino content"
on public.casino_content
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.casinos
    where casinos.id = casino_content.casino_id
      and casinos.status = 'active'
  )
);