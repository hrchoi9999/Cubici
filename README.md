# Cubici Workspace

This workspace separates the legacy Java service from the new public website, analysis scripts, sample data, reports, and operational docs.

## Layout

- `legacy-java`: existing Java/Spring/JSP/Tomcat source kept as reference material
- `website`: static public homepage and demo dashboard project
- `analysis`: Python data analysis and sample-data generation
- `data_sample`: anonymized or synthetic datasets only
- `reports`: generated charts, Excel files, PDFs, and HTML reports
- `docs`: setup notes, deployment notes, and work memos
- `private_local`: local-only sensitive backups and legacy Git history, ignored by Git

## Current Environment Notes

- Frontend deploys from `website` to Cloudflare Pages.
- Local backend runs from `cubici_redem` on `http://127.0.0.1:18080`.
- Local MySQL runs on `127.0.0.1:3307`, database `cubici`.
- Python 3.10 analysis environment is available at `.venv310`.
- See `docs/ENVIRONMENT_SETUP.md` and `docs/PRODUCTION_DEPLOYMENT.md` for current setup and deployment notes.
