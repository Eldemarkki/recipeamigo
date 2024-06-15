# Recipeamigo

You can visit the deployed demo at https://recipeamigo.eetumaenpaa.fi.

Recipeamigo is a platform where you can create and share recipes with other people. You can group recipes into collections, such as "Easy to prepare" or "My in-laws' favorites". You can like recipes to save them for later. Each recipe and recipe collection has a visibility that can be set to either public, unlisted or private. Recipes can be tagged with tags, such as "Lactose-free" or "Vegetarian".

The application features localization for English and Finnish, and there are a light and dark theme available. It is also fully responsive on mobile screen sizes.

The recipe editor has an exhaustive list of existing, localized ingredients. It combines the ingredient name, amount and unit into a natural sounding result, such as "2 kilograms of tomatoes" or "1 liter of milk". This works for both languages. The instruction editor allows you to embed timers into the instructions, making the cooking process easier.

The browse page allows you to search all the public recipes that exist. You can filter by many properties, such as title, tags, preparation time or by excluding specific ingredients. The results can be sorted and they are paginated.

There are a total of 200+ integration and unit tests to make sure the API works and is secure. The project has a CI/CD pipeline that checks linting, formatting and tests on each commit, as well as deploys the project to Vercel.

This is my submission for the [Full Stack Open project](https://fullstackopen.com/osa0/yleista#full-stack-harjoitustyo). The time logging is at [docs/timelog.md](./docs/timelog.md).

## Technologies used

- React
- Next.js
- TypeScript
- ESLint + Prettier
- PostgreSQL (database)
- Minio (S3/object storage)
- Clerk (authentication)
- Vercel (deployment)
- Vitest (unit & integration testing)

### Libraries worth mentioning

- Prisma (ORM)
- i18next (localization)
- Zod (validation)
- Tiptap (rich text editor for instructions)
- PDFKit (PDF generation)
- react-hot-toast (toast notifications)

## Infrastructure

The app is hosted on [Vercel](https://vercel.com/), and uses [Clerk](https://clerk.dev/) for authentication. The database and S3/object storage are hosted on a Linux/Ubuntu server from [OVH](https://ovhcloud.com/) (1vCPU, 2GB RAM, 20GB SSD).

![Infrastructure diagram. Three sections, from left to right: Clerk.com (authentication), Vercel (has boxes "Next.js backend" and "Next.js" frontend), Linux/Ubuntu VPS (1vCPU, OVH, 2GB RAM, 20GB SSD) (has boxes "PostgreSQL database", "Minio (S3/object storage)" and "Minio admin panel"). There are arrows between Clerk.com and Next.js backend, Clerk.com and Next.js frontend, Next.js backend and Next.js frontend, Next.js backend and PostgreSQL database, Next.js backend and Minio, Next.js frontend and Minio, and Minio and Minio admin panel](./docs/infrastructure.png)

## To deploy

Things you need:

- S3 instance (tested with Minio, but should with with others as well)
- PostgreSQL instance
- Hosting the app itself (e.g. Vercel)
- Clerk.com account (auth provider)

## To develop

Things you need:

- Node.js (tested with Node.js 18)
- Docker (or PostgreSQL and Minio hosted somehow)
- Clerk.com account

### Run the development environment

1. Clone the repository with `git clone https://github.com/Eldemarkki/recipeamigo.git`
2. Run `npm install`
3. Create a `.env.local` file based on `.env.local.example`, and fill in the missing fields for Clerk.
4. Run the PostgreSQL database and Minio with `docker compose -f compose-dev.yaml up`
5. Generate the Prisma schema: `prisma generate`
6. Apply migrations to the database: `npm run migrate:dev`
5. Run `npm run dev`
6. Go to http://localhost:3000

## Features

- [x] Passwordless login
- [x] Public recipes
- [x] Edit recipe
- [x] Recipe cover image upload
- [ ] Recipe image gallery
- [ ] Reference ingredient in instructions
- [x] Themes (light/dark/others)
- [x] Localization (English, Finnish)
- [ ] Metric/Imperial conversion
- [x] Mobile friendly
- [x] Print recipe
- [x] Export recipe
  - [x] JSON
  - [x] PDF
  - [x] Markdown
- [x] Recipe time estimation (manual)
- [x] Browse recipes
  - [x] Exclude recipes with certain ingredients
  - [x] Only vegetarian, gluten-free, etc.
  - [x] Less than X minutes
- [x] Recipe tags/categories
- [x] Likes
- [x] Collection for showing liked recipes
- [x] Save recipes to collections
  - [x] Private collections
  - [x] Public collections
  - [x] Unlisted collections
- [x] Embedded timer ("cook for 5 minutes", click to start timer)
- [ ] Simple instructions-view (big font, no bloat)
- [ ] Notes/tips/warnings among instructions
- [ ] "I have these ingredients, what can I make?"
- [x] How many times has a recipe been viewed
- [ ] Recipe importing (JSON)
- [ ] Required tools (e.g. oven, blender, etc.)
- [ ] Ingredient substitution (e.g. "use 1/2 cup of milk instead of 1/2 cup of cream")
- [ ] Share to social media
- [x] Ingredient bank (standardized ingredient names so that they can be translated)
- [ ] "Forking" a recipe (copying it to your own account, with a link to the original)
- [ ] Text area for the "story" of the recipe that can be collapsed to hide it
- [x] Optional ingredients
- [ ] Share links
  - [x] Private (only visible to author)
  - [x] Public (partially done, requires implementing the Browse view)
    - [x] Listed in Browse view
    - [x] Unlisted, only visible with direct link
  - [ ] Password protected
  - [ ] Share with selected registered users
- [ ] Draft status (only visible to author)
