# Contributing to Awesome AI Launch List

Thanks for helping keep this list useful! Here's how to contribute.

## How to Add a New Site

1. **Fork** this repository
2. **Edit** `README.md` — add your entry to the correct category table
3. **Submit a Pull Request** using the provided template

### Entry Format

Add a new row to the appropriate category table:

```markdown
| # | [Site Name](https://example.com/) | DR | Traffic | Pricing | DF/NF | [Submit](https://example.com/submit) |
```

**Required fields:**

| Field | Description | Example |
|-------|-------------|---------|
| Site Name | Name with link to homepage | `[BetaList](https://betalist.com/)` |
| DR | Domain Rating from [Ahrefs](https://ahrefs.com/website-authority-checker) (free check) | `72` |
| Traffic | Estimated monthly visits (use K/M suffixes) | `200K+` |
| Pricing | Free, Paid, Free / Paid, or Revenue share | `Free / Paid` |
| Link | Dofollow (DF) or Nofollow (NF) | `DF` |
| Submit | Link to submission page, or "Self-serve form" | `[Submit](https://...)` |

### Where to Place Your Entry

- Add to the **end** of the most relevant category table
- Update the row number (`#` column)
- If unsure about the category, pick the closest one — reviewers can move it

## Updating Existing Entries

If a site's DR, traffic, pricing, or submission URL has changed:

1. Update the specific field(s)
2. In your PR description, mention what changed and how you verified it

## Quality Standards

We accept sites that meet **all** of these criteria:

- **Allows product submissions** — the site must have a way for makers to list their product
- **Is operational** — no dead links, parked domains, or abandoned sites
- **DR ≥ 15** — minimum domain authority to be worth the submission effort
- **Not a spam/PBN site** — must be a legitimate directory or community

We **do not** accept:

- Sites that are purely pay-to-play with no free option (unless they provide exceptional value, e.g. AppSumo)
- Personal blogs or sites with no submission process
- Duplicate entries of sites already listed

## Verifying DR and Traffic

Use any of these free tools:

- [Ahrefs Free Website Authority Checker](https://ahrefs.com/website-authority-checker)
- [Semrush Authority Score](https://www.semrush.com/analytics/overview/)
- [SimilarWeb](https://www.similarweb.com/) for traffic estimates

Approximate values are fine — just be in the right ballpark.

## Code of Conduct

- Be respectful in discussions and PR reviews
- Don't submit your own site unless it genuinely fits the list criteria
- Don't remove competitors' entries without a valid reason (dead link, scam, etc.)
- Keep PR descriptions clear and concise

## Questions?

Open an [issue](../../issues) if you're unsure about anything. We're happy to help.
