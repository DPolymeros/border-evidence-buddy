# Border Digital Evidence Assistant (BDEA)

> An academic proof-of-concept for the digital evidence chain of custody and decision support of first responders at EU external borders.

## Overview

The Border Digital Evidence Assistant (BDEA) is a bilingual (English/Greek) web application developed as the practical artifact of an MSc dissertation at the **University of East London**, in the programme *Information Security and Digital Forensics*.

The application operationalises selected principles from established digital forensics frameworks (ACPO, INTERPOL, ENISA, NIST SP 800-86, and ISO/IEC 27001) for first responders at EU external borders, with particular focus on the operational reality of Frontex officers and Hellenic Police officers handling seized digital devices.

## Academic Context

**Dissertation title**: *Digital Evidence Handling by First Responders at EU External Borders: Operational Gaps, Legal Constraints, and a Framework for Cross-Border Law Enforcement*

**Institution**: University of East London (delivered through partner institution)
**Programme**: MSc Information Security and Digital Forensics
**Methodology**: Design Science Research (Hevner et al., 2004)

## Purpose

BDEA addresses two empirically documented gaps in the digital evidence handling literature:

1. **Documentation gap**: The absence of standardised digital chain of custody tools at the Frontex/national authority handover point
2. **Knowledge gap**: The lack of accessible field-level guidance for first responders aligned with international standards

## Features

- **Chain of Custody**: Structured digital form with mandatory fields aligned with ACPO and INTERPOL principles
- **Photographic Documentation**: Capture of device images with timestamp and geolocation metadata
- **Multi-User Handover Log**: Documentation of evidence transfers between officers and agencies
- **Decision Support Wizard**: Contextual, scenario-based guidance for first responders based on device type and condition
- **PDF Report Export**: Generation of formal chain of custody documentation
- **Bilingual Interface**: English and Greek, suitable for Frontex and Hellenic Police contexts

## Technical Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Build tool**: Vite
- **Data persistence**: Browser local storage (no backend, GDPR-conscious by design)
- **PDF generation**: jsPDF
- **Development**: AI-assisted prototyping (Lovable platform)

## Disclaimer

> This application is an **academic prototype** developed for research purposes only.  
> It is **not intended for operational law enforcement deployment** in its current form.  
> Production deployment would require formal security audit, penetration testing, accessibility review, and full GDPR Article 32 compliance assessment.

## Installation (local execution)

Requires Node.js 18+ and npm.

```bash
git clone https://github.com/[your-username]/[repository-name].git
cd [repository-name]
npm install
npm run dev
```

The application will be accessible at `http://localhost:5173` (or as indicated in the terminal output).

## Reference Frameworks

The functional design of BDEA is informed by the following frameworks:

- ACPO (2011) *Good Practice Guide for Digital Evidence*, Version 5
- INTERPOL (2021) *Guidelines for Digital Forensics First Responders*
- ENISA (2014) *Electronic Evidence — A Basic Guide for First Responders*
- NIJ (2008) *Electronic Crime Scene Investigation: A Guide for First Responders*, Second Edition
- NIST (2006) *SP 800-86: Guide to Integrating Forensic Techniques into Incident Response*
- ISO/IEC 27001:2022 *Information Security Management Systems*

## Limitations

This is a proof-of-concept implementation. The following are explicitly out of scope:

- Cryptographic hashing of evidence files
- Tamper-evident logging mechanisms
- Production-grade authentication
- Server-side data persistence
- Cross-device synchronisation
- Formal accessibility compliance

These are discussed in the dissertation as directions for future work.

## License

MIT License — see `LICENSE` file for details.

## Citation

If referencing this work:

> Polymeros, Dimitrios (2026) *Border Digital Evidence Assistant (BDEA): A first-responder chain of custody and decision-support prototype*. MSc dissertation artifact, University of East London. Source code available at: https://github.com/DPolymeros/border-evidence-buddy

## Contact

Dimitrios Polymeros  
MSc Student, Information Security and Digital Forensics  
University of East London
