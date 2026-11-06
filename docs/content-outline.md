# Proposed content outline: Ahmad Abuadas portfolio

Sources: resume (`Ahmad_resume_2026.doc`, text recovered from a damaged file), public GitHub repos,
and local project READMEs. LinkedIn was **skipped** because it requires a login, so please paste the
LinkedIn content. Items marked ❓ need your confirmation.

## Hero
- **Name:** Ahmad Abuadas
- **Typewriter roles:** Big Data Engineer · AI Engineer · AML Analytics · Data Platform Builder
- **Pitch (draft):** "Data and AI engineer with 10+ years in software and 7+ in big data, now at Citi.
  I build the pipelines that move financial data at scale, and the AI that reads it: AML detection,
  reconciliation, and LLM agents."
- **Impact stats (draft, need real numbers ❓):** `10+ yrs` engineering · `4` industries (banking, med-device,
  industrial IoT, gov) · `15+` shipped projects
- **CTAs:** Download resume (PDF ❓, since the .doc is damaged) · Let's connect
- **Animated backdrop:** streaming lanes: Teradata/Kafka/OPC → Spark/Airflow → Snowflake/Hive → Model/LLM → Alerts/Dashboards

## Skills matrix (grouped)
| Group | Skills |
|---|---|
| AI / ML | PyTorch, TensorFlow, scikit-learn, XGBoost, LLMs, RAG, fine-tuning (OpenAI, Vertex AI), LangChain, LlamaIndex, agentic AI, anomaly detection |
| Data engineering | PySpark, Spark/Scala, Hadoop (HDFS, Hive, Impala, Sqoop, Oozie), Kafka, Airflow, dbt, Databricks, Talend, Alteryx |
| Warehouses & DBs | Snowflake, Redshift, Postgres, Oracle, SQL Server, MySQL, MongoDB, Cassandra, HBase, vector DBs (Pinecone, Chroma, Milvus, Astra DB) |
| Backend & languages | Python, SQL, Scala, Java, R, JavaScript/TypeScript, FastAPI, Flask, Ruby on Rails |
| Frontend & BI | React, Next.js, Tailwind, Streamlit, R Shiny, Tableau, Power BI, SSRS |
| Cloud & DevOps | AWS (S3, EC2, EMR, Lambda, Glue, Kinesis, IAM, RDS), GCP, Docker, Kubernetes, Jenkins, Autosys, RLM, GitHub Actions, Netlify |
| FinTech / AML | Transaction monitoring, AML typologies (structuring, round-trip, large cash), entity resolution, graph detection, reconciliation, regulatory reporting |
| Industrial / OT | PLC (Rockwell, Siemens), SCADA/HMI, OPC, MQTT, DeviceWise |

## Experience timeline
1. **Citi** · Big Data Engineer · Sep 2022 – present · Jacksonville, FL
2. **Kelvin Inc.** · IT/OT Data Engineer · Mar 2022 – Sep 2022
3. **Johnson & Johnson Vision Care** · Software Data Engineer · Apr 2019 – Apr 2022
4. **Fibertex Nonwovens** · Software Data Engineer · Aug 2016 – Oct 2018
5. **Ministry of Public Works & Housing, Jordan** · Junior Engineer · Feb 2012 – Mar 2016
- **Education:** Master's in Information Technology (Big Data). School and year ❓

## Professional projects (at work)
| # | Project | Employer | Status | Architecture sketch |
|---|---|---|---|---|
| 1 | Cross-market reconciliation platform | Citi | `draft` | Teradata/HDFS → PySpark transforms → Hive → validation → Autosys/Jenkins/RLM CI/CD → reports |
| 2 | AML transaction monitoring & detection (L1–L5 typologies) | Citi ❓ (or advisory work?) | `draft` | Transactions → Snowflake/dbt → Airflow → rules + anomaly + graph detection → risk score → alerts and regulatory reports |
| 3 | Hive → Snowflake migration agent (LLM) | Citi ❓ | `draft` | Hive DDL/SQL → LLM conversion agent → lineage mapping → Snowflake validation |
| 4 | Kelvin device-to-cloud bridges + POV UI | Kelvin | ready | OPC/MQTT bridges → Kelvin platform (AWS) → Snowflake → Streamlit POV |
| 5 | EDHR + Raw Material Tracking (real-time manufacturing) | J&J Vision | ready | PLC/DeviceWise triggers → Oracle → Java web apps |
| 6 | YAS: Yield Analysis System (ML + text mining) | J&J Vision | ready | Vision system → Python ML → R visualizations |
| 7 | Device-data big data + defect prediction | J&J Vision | ready | Devices → HDFS → PySpark/Scala ML → Airflow on GCP |
| 8 | Alarm & event tracking system | J&J Vision | ready | SQL DB → Python real-time app → alerts |
| 9 | Spare part management system | Fibertex | ready | Rails + JS + SQL; PLC/HMI safety interface |

Impact metrics are **missing for every work project**. Placeholders like "↓ reconciliation breaks"
will be shown until you give numbers.

## Side projects (GitHub + local)
| Project | One-liner | Stack | Link |
|---|---|---|---|
| Exposed-Trump | Evidence-mapped investigation: 48 findings, 88 sources, 89 cited edges | Python pipeline, YAML, Vite, Cytoscape.js | public repo |
| PolitiAI | AI agent that digests politicians' X activity into daily email briefings | X API, GPT-4, AWS | private ❓ |
| Medical coding AI agent | LLM assistant for four coding/compliance roles | LLM, RAG | private ❓ |
| Centralized AI Governance Platform | Model governance, risk and incident management | React, FastAPI, Postgres, Redis, Elasticsearch, Celery, Terraform | public repo |
| PaymentCo 2030 AI Portfolio Simulator | Live NPV/ROI board tool for a $15M AI budget | React, TS, Vitest, SheetJS | public repo |
| Who Owns the Ledger? (Nest Yield) | Fintech strategy simulator with 1,000-run Monte Carlo, EN/AR | React, TS, Vitest | public repo |
| Meridian Credit Labs | Explainable loan-review engine with human-in-the-loop, 23 tests | Python stdlib, Netlify Functions | public repo |
| LinqAlpha: Trust You Can Prove | Animated strategy app + compliance console + presenter mode | React, TS, Vite | public repo |
| The Paycheck Platform | Animated fintech business-case walkthrough | Vanilla JS, single file | public repo |
| Solana multi-agent trading bot | Copy-trade + social-signal trading agents | Python, Solana | private ❓ |
| American Mediterranean Cuisine | Production catering site with order builder and CMS | Astro, React islands, Netlify Functions, Stripe | public repo |
| ADAM Data Services site | 3D animated company site | React, Three.js, Framer Motion | public repo |
| QuantumChain | (README is the Next.js default; need a one-liner ❓) | Next.js | public repo |

Proposal: show **6 featured side projects** with full animated diagrams and list the rest as compact cards.

## Contact
Email ❓ (resume has `ahmadabuadas2013@gmail.com`; your account uses `aja.it.2019@gmail.com`), LinkedIn, GitHub.
Phone hidden by default. The form uses Netlify Forms (no backend).

## Data schema (one entry = one project, no UI changes)
```ts
{
  id, title, summary, role, timeframe, employer?, category: "work" | "side",
  status: "live" | "shipped" | "draft", featured: boolean,
  problem, stack: string[], impact: { value, label }[],
  links: { github?, demo?, caseStudy? },
  architecture: {
    nodes: { id, label, kind, lane, detail?, flags?: ("ai"|"security"|"test")[] }[],
    edges: { from, to, label? }[],
    steps?: { nodeIds: string[], caption: string }[]   // "play the pipeline" mode
  }
}
```
