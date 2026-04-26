# Workspace Notes

## 2026-04-26

- Created `C:\Cubici_original_backup` before reorganizing files.
- Moved the existing Java/Spring/JSP application into `legacy-java`.
- Moved the real DB backup into `private_local`.
- Moved the legacy `.git` directory into `private_local\legacy_git` to prevent accidentally pushing old history or sensitive files.
- Moved legacy source secrets into `private_local\legacy_secrets` and left sanitized `.example` files in `legacy-java`.
- Created top-level folders for website, analysis, sample data, reports, and docs.

## Immediate Next Steps

1. Install Git and Python.
2. Initialize a fresh private Git repository at `C:\Cubici`.
3. Review ignored sensitive files before the first commit.
4. Install website dependencies and run the local dev server.
5. Create synthetic sample datasets and report prototypes.
