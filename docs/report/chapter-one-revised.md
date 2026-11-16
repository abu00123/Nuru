# CHAPTER ONE: INTRODUCTION

## 1.1 Background to the Study

Forced displacement remains a major global humanitarian challenge. At the end of 2025, an estimated 117.8 million people were forcibly displaced worldwide, including 41.6 million refugees, and nearly 4.4 million refugees returned to their countries of origin during that year (United Nations High Commissioner for Refugees [UNHCR], 2026a). Return involves more than crossing a border: refugees may need to consider security, housing and property, livelihoods, access to services, and their connections to family and communities in their places of origin (Alrababah & Casalis, 2024).

A voluntary return decision depends, in part, on whether a person can obtain relevant information and judge how current and credible it is, and information gaps have been identified as an area requiring further research in relation to return decisions (Alrababah & Casalis, 2024). Refugees consult many channels, including relatives, community members, humanitarian staff, media, and online sources, and research among South Sudanese refugees in Uganda shows the importance of examining both how refugees seek information and the difficulties they face in using it (Mukungu & Ngulube, 2026; Mukungu et al., 2026). Digital services such as Refugee.Info and Julisha.Info show how such information can be organised into searchable content, which raised the design question for this project: whether return-related information could be made easier to locate, understand, and assess while remaining connected to the organisations that provide direct support.

The question is relevant in Rwanda, where 53,486 forcibly displaced people from Burundi were recorded as of 30 June 2026, and where UNHCR reports that more than 30,000 Burundian refugees have returned home since August 2020 (UNHCR, 2026b). Mahama, which had 71,503 forcibly displaced residents of several nationalities at the same date (UNHCR, 2026b), provided a defined setting for the study. Refugees there who are considering return can approach UNHCR staff at the Registration Centre to begin the formal process (UNHCR, n.d.), but they may also need information about conditions in a particular destination, documentation, healthcare, education, livelihoods, and available assistance. This study used an online questionnaire and remote usability testing with participants who live or have lived in Mahama to guide the design, development, and evaluation of Nuru, a prototype system that organises return information from identifiable sources and shows when each entry was last checked, while leaving the decision to return with the individual.

## 1.2 Statement of the Problem

For Burundian refugees in Mahama, understanding the formal return procedure is only one part of deciding whether, when, and where to return, because the conditions that matter to a potential returnee differ across places and change over time (Alrababah & Casalis, 2024). Information about these conditions may be available from humanitarian organisations, government publications, community networks, media, and digital platforms, but it can be difficult to find information relevant to a particular destination, to establish when it was produced, and to judge whether it can be relied upon. Studies in other settings show that technological and social barriers affect how refugees access and assess information (Mukungu & Ngulube, 2026; Mukungu et al., 2026), but they do not establish which difficulties Burundian refugees in Mahama experience.

The central problem addressed by this project was therefore a lack of context-specific evidence about what return-related information potential users in Mahama need, how they find and assess it, and how a digital system could organise it responsibly. A system that merely collects material in one place could reproduce the same problem if its entries are outdated, lack clear sources, or imply that conditions have been verified when they have not. Nuru was designed to complement existing information and counselling services; it does not assess the safety of an individual's return or decide whether they should return.

## 1.3 Aim and Objectives of the Study

### 1.3.1 Aim

The aim of this study was to design, develop, and evaluate a prototype digital return information management system that helps Burundian refugees in Mahama Refugee Settlement access and assess information relevant to voluntary return.

### 1.3.2 Specific Objectives

1. To investigate the return-related information needs, current information sources, access challenges, and system requirements of potential users in Mahama.
2. To design and develop a system that enables users to find return-related information by topic and intended destination, and to view each entry's source, source publication date, and date last checked.
3. To implement administrative functions for creating, categorizing, and updating information, recording source checks against the current version of each entry before publication, withdrawing or marking entries as outdated, and resolving user reports of problems.
4. To evaluate the prototype against the identified requirements, with particular attention to whether users can find, understand, and assess relevant information, as well as the system's functionality, usability, accessibility, and responsiveness.

## 1.4 Research Questions

1. What return-related information do potential users in Mahama need when considering voluntary return to Burundi, and where do they currently obtain it?
2. What challenges do potential users face in accessing information relevant to their intended destination and judging its source, currency, and relevance?
3. What user-facing and administrative requirements should a digital system meet to organize return-related information and support its checking, updating, and withdrawal?
4. To what extent does the developed prototype meet the identified requirements for finding and understanding information, functionality, usability, accessibility, and responsiveness?

## 1.5 Project Scope

The project focused on Burundian refugees in Mahama Refugee Settlement who seek information about voluntary return to Burundi. Because physical fieldwork at Mahama was not conducted, participants were recruited from current African Leadership University students aged 18 or above who live or have previously lived in Mahama. Requirements were gathered through an online questionnaire, which received 25 responses between 10 and 15 November 2026, and the prototype was evaluated through remote usability sessions over Google Meet with five participants. No interviews were conducted and no sessions were recorded. This purposive sample provided exploratory evidence and was not treated as representative of all Burundian refugees or current Mahama residents.

The project developed a web application, comprising a public interface, an administrator dashboard, a Django REST Framework backend, and a PostgreSQL database, together with a mobile prototype that uses the same backend. Content was organised into eight categories (return procedures, documents, safety, housing, healthcare, education, livelihoods, and support services) and selected destinations in Burundi at country, province, and commune level. Users can browse, search, and filter information, view each entry's source and dates, follow step-by-step guides with useful contacts, and report problems without an account, while administrators can create and edit entries, record source checks, publish or withdraw content, inspect revision history, and resolve reports. The interface was provided in Kirundi, Kinyarwanda, and Kiswahili in addition to English. Offline access, SMS, push notifications, and performance benchmarking were outside what was completed. The prototype does not recommend return decisions, certify destination safety, process repatriation applications, or provide individualized legal or medical advice.

## 1.6 Significance and Justification

The project offers potential returnees a way to locate return-related information and to see the basis and currency of each entry through its source and dates, while administrative functions and user reports support the correction and maintenance of content. The study also generated findings from participants with lived experience of Mahama about information needs, access challenges, and preferred system functions. Academically, it demonstrates the application of requirements gathering, software development, and testing to a humanitarian information problem, although the applicability of its findings beyond Mahama would require further investigation. The project was justified because the availability of information and counselling services alone does not establish whether users can locate current, understandable, and destination-relevant content.

## 1.7 Research Budget

The research budget covered the essential costs associated with data collection, communication, transportation, and preparation of the final project. Freely available digital tools and existing university resources were used wherever possible to minimize costs. Table 1.1 presents the planned budget.

**Table 1.1: Research Budget**

| Item | Purpose | Estimated Cost (RWF) |
|---|---|---|
| Transportation | Travel related to research and data collection | 40,000 |
| Internet/Data | Online literature review, communication, data collection, and system development | 30,000 |
| Printing/Photocopying | Consent forms, questionnaires, and other research materials | 15,000 |
| Stationery | Note-taking and fieldwork materials | 10,000 |
| Communication | Calls and communication with participants and relevant stakeholders | 15,000 |
| Software/Development resources | Hosting, testing, or other resources not available through free tools | 30,000 |
| **Total** | | **140,000** |

## 1.8 Definition of Terms

**Voluntary return:** The free and informed decision of a refugee to return to their country of origin.

**Potential returnee:** A refugee who is considering voluntary return, whether or not they have registered for repatriation.

**Destination:** A location in Burundi to which an entry applies, recorded at country, province, or commune level.

**Information entry:** A unit of published guidance in Nuru, consisting of a title, summary, content, category, destination, and cited source.

**Source check:** An administrator's recorded judgement that an entry accurately represents its cited source. It does not confirm conditions on the ground.

**Content version:** A number that increases whenever an entry's substantive content changes. A source check applies only to the version that was checked.

**Prototype:** A working version of a system built to demonstrate and test its main functions, not a finished product ready for wide deployment.
