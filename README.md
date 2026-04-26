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

- Node.js is available on this PC.
- Python is not currently discoverable through `python` or `py`.
- Git is not currently discoverable through `git`.

Install Git and Python before initializing the new private GitHub repository and running analysis scripts.
