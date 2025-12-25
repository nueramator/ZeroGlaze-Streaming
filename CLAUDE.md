## Operating Principles

**1. Check for tools first**
Before writing a script, check `execution/` per your directive. Only create new scripts if none exist.

**2. Self-anneal when things break**
- Read error message and stack trace
- Fix the script and test it again (unless it uses paid tokens/credits/etc—in which case you check w user first)
- Update the directive with what you learned (API limits, timing, edge cases)
- Example: you hit an API rate limit → you then look into API → find a batch endpoint that would fix → rewrite script to accommodate → test → update directive.

**3. Update directives as you learn**
Directives are living documents. When you discover API constraints, better approaches, common errors, or timing expectations—update the directive. But don't create or overwrite directives without asking unless explicitly told to. Directives are your instruction set and must be preserved (and improved upon over time, not extemporaneously used and then discarded).

## Self-annealing loop

Errors are learning opportunities. When something breaks:
1. Fix it
2. Update the tool
3. Test tool, make sure it works
4. Update directive to include new flow
5. System is now stronger


## Constraints & Policies

**Security – MUST follow:**

* NEVER expose `GEMINI_API_KEY` to the client — server-side only
* ALWAYS use environment variables for secrets
* NEVER commit `.env.local` or any file containing API keys
* Validate and sanitize all user input

**Code quality:**

* TypeScript strict mode
* Run `npm run lint` before committing
* No `any` types without explicit justification

**Dependencies:**

* Prefer Shadcn components over adding new UI libraries
* Minimize external dependencies for MVP

---

## Repository Etiquette

**Branching:**

* ALWAYS create a feature branch before starting major changes
* NEVER commit directly to `main`
* Branch naming: `feature/description` or `fix/description`

**Git workflow for major changes:**

1. Create a new branch:

   * `git checkout -b feature/your-feature-name`
2. Develop and commit on the feature branch
3. Test locally before pushing:

   * `npm run dev` — start dev server at `localhost:3000`
   * `npm run lint` — check for linting errors
   * `npm run build` — production build to catch type errors
4. Push the branch:

   * `git push -u origin feature/your-feature-name`
5. Create a PR to merge into `main`
6. Use the `/update-docs-and-commit` slash command for commits — this ensures documentation is updated alongside code changes

**Commits:**

* Write clear commit messages describing the change
* Keep commits focused on a single change

**Pull Requests:**

* Create PRs for all changes to `main`
* NEVER force push to `main`
* Include a description of what changed and why

## Documentation

- [Project Spec](docs/Project_Spec_doc.md) – Full requirements, API specs, tech details
- [Architecture](docs/architecture.md) – System design and data flow
- [Changelog](docs/changelog.md) – Version history
- [Project Status](docs/project_status.md) – Current progress
- Update files in the docs folder after major milestones and major additions to the project.
- Use the /update-docs-and-commit slash command when making git commits
