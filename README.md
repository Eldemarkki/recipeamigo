# Recipeamigo

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). This is my project for the [Full Stack Open course](https://fullstackopen.com/osa0/yleista#full-stack-harjoitustyo).

## To deploy

Things you need:

- S3 instance (tested with Minio, but should with with others as well)
- PostgreSQL instance
- Hosting the app itself (e.g. Vercel)
- Clerk.com account (auth provider)

## To develop

Things you need:

- Node.js
- Docker
- Clerk.com account

### Run the development environment

1. Clone the repository with `git clone https://github.com/Eldemarkki/recipeamigo.git`
2. Run `npm install`
3. Create a `.env.local` file based on `.env.local.example`, and fill in the missing fields for Clerk.
4. Run the PostgreSQL database and Minio with `docker compose -f compose-dev.yaml up`
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
- [ ] Collection for showing liked recipes
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
