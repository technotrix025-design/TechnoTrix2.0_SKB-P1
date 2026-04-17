# TechnoTrix2.0_SKB-P1
# 🌿 ESG & GHG Monitoring Platform

## Digital Intelligent Platform for Environmental, Social & Governance Performance

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.32.0-red.svg)](https://streamlit.io)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Hackathon](https://img.shields.io/badge/Hackathon-24%20Hours-orange.svg)]()

---

## 📌 Project Overview

**Problem Statement ID:** SKB_P1

**Theme:** Smart Sustainability / Green Tech / AI for Social Good

**Category:** Software / AI-ML based Solution

### The Problem We Solve

Organizations today struggle with fragmented Environmental, Social, and Governance (ESG) data scattered across multiple departments and suppliers. This leads to:

- ❌ Manual Excel-based reporting with **40% error rates**
- ❌ No real-time visibility into carbon footprint
- ❌ Weak Scope 3 (supply chain) data collection
- ❌ Poor audit readiness and board oversight
- ❌ **78% of companies still use spreadsheets** for ESG reporting

### Our Solution

An **AI-powered digital platform** that centralizes ESG data, automates GHG emissions calculation, and provides audit-ready reports in minutes instead of weeks.

---

## 🎯 Core Features

| Feature | Description |
|---------|-------------|
| 📁 **Multi-format Upload** | Supports CSV, Excel, and API data ingestion |
| 🔢 **Automated GHG Calculation** | Calculates Scope 1, 2, and 3 emissions using GHG Protocol standards |
| 📊 **Interactive Dashboard** | Real-time visualization of carbon footprint by scope and department |
| 🔒 **Audit Trail** | Immutable logging with SHA256 hashing for compliance |
| 🏭 **Supplier Quality Scoring** | Tracks and improves Scope 3 data quality |
| 🚨 **Board Escalation** | One-click alert mechanism for threshold breaches |
| 📄 **Auto-report Generation** | Downloadable ESG reports (CDP/BRSR/CSRD ready) |

---

## 🏗️ System Architecture
┌─────────────────────────────────────────────────────────────────┐
│ USER INTERFACE LAYER │
│ Admin Dashboard │ Supplier Portal │ Board View │
├─────────────────────────────────────────────────────────────────┤
│ APPLICATION LAYER │
│ Analytics │ Reporting │ Alerting │ Compliance │ Export │
├─────────────────────────────────────────────────────────────────┤
│ INTELLIGENCE LAYER │
│ Anomaly Detection │ Forecasting │ Supplier Scoring │
├─────────────────────────────────────────────────────────────────┤
│ PROCESSING LAYER │
│ ETL Pipeline │ Normalizer │ Factor Mapper │ Aggregator │
├─────────────────────────────────────────────────────────────────┤
│ DATA COLLECTION LAYER │
│ IoT │ ERP │ REST API │ CSV/Excel │ Supplier Portal │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ USER INTERFACE LAYER │
│ Admin Dashboard │ Supplier Portal │ Board View │
├─────────────────────────────────────────────────────────────────┤
│ APPLICATION LAYER │
│ Analytics │ Reporting │ Alerting │ Compliance │ Export │
├─────────────────────────────────────────────────────────────────┤
│ INTELLIGENCE LAYER │
│ Anomaly Detection │ Forecasting │ Supplier Scoring │
├─────────────────────────────────────────────────────────────────┤
│ PROCESSING LAYER │
│ ETL Pipeline │ Normalizer │ Factor Mapper │ Aggregator │
├─────────────────────────────────────────────────────────────────┤
│ DATA COLLECTION LAYER │
│ IoT │ ERP │ REST API │ CSV/Excel │ Supplier Portal │
└─────────────────────────────────────────────────────────────────┘

text

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Streamlit |
| Backend | Python 3.10+ |
| Data Processing | Pandas, NumPy |
| Visualization | Plotly |
| AI/ML | Scikit-learn (Isolation Forest) |
| Database | SQLite (MVP) → PostgreSQL (Scale) |
| Deployment | Hugging Face Spaces / Streamlit Cloud |

---

## 📊 GHG Calculation Methodology

### Emission Factors Used (India-specific)

| Activity | Unit | Emission Factor | Scope | Source |
|----------|------|----------------|-------|--------|
| Electricity | kWh | 0.82 kg CO2e | Scope 2 | CEA India |
| Diesel | liter | 2.68 kg CO2e | Scope 1 | IPCC |
| Natural Gas | m³ | 2.00 kg CO2e | Scope 1 | GHG Protocol |
| Air Travel | km | 0.15 kg CO2e | Scope 3 | Defra |
| Freight | tkm | 0.06 kg CO2e | Scope 3 | GLEC |
| Purchased Goods | USD | 0.35 kg CO2e | Scope 3 | EXIOBASE |


#  Team Name
## TechnoTrix 2.0

# Team Name
## Pranay Rajkondawar
## Mayur Harde
## Pranay Pancahwate
## Hement Bhure
## Mrunal Khapekar
