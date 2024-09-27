---
title: An Introduction to Open Table Formats
date: 2024-09-27 15:00:00 + 0000
categories: [Articles, Open Table Formats]
tags: [aws, databricks, metastores, catalogs, hive-metastore, glue, unity catalog, opentable, iceberg, deltalake, hudi, xtable]     # TAG names should always be lowercase
author: ismail
toc: true
img_path: /assets/img/open-table-formats/
---

In this article, I would like to tell the story of how I found out about Open Table formats and how I chose to work with Apache Iceberg while being someone primarily focussed on Databricks Data Engineering.

When I started working in Data Engineering, My journey began with **Apache Spark and Hadoop**, soon moving on to Object Storage specifically **AWS S3**, which seemed like the perfect setup at the time. We could scale effortlessly and avoid the high costs of traditional databases. Processing data with Spark was fast and flexible, and S3’s pricing made it cost-effective compared to the hefty investments needed for database hardware and maintenance.

However, as our datasets grew, so did the challenges. While storing data on S3 was cheap, managing it became more complex. Our need for larger-scale analytics and faster processing led to rising operational costs. It became clear that simply throwing more resources at the problem wasn’t sustainable.

We added **Hive Metastore** to bring some structure to the raw data on S3. Hive made querying data easier with SQL, and Spark handled batch processing. But issues soon appeared. Performing **updates** and **deletes** was inefficient — each small change meant rewriting entire partitions. This became time-consuming and didn’t scale well as our workloads increased.

Another major issue was **consistency**. Without **ACID transactions**, multiple jobs writing to the same dataset created risks of partial updates or data corruption. The larger our datasets became, the more time we spent managing these problems instead of focusing on productive work.

Things worsened when we needed to integrate **real-time processing**. Hive was great for batch jobs, but we lacked a way to handle streaming data efficiently. Without built-in support for **upserts** and **deletes**, managing data became messy, and our data lake was soon full of unmanageable files.

At this point, I began looking into **open table formats** like **Apache Iceberg** and **Delta Lake**. These formats directly addressed our biggest challenges.

**_[Open table formats](https://www.teradata.com/platform/open-table-formats) are open-source, standard table formats for working with very large datasets in a performant way. They provide a layer of abstraction on top of [data lakes](https://www.teradata.com/insights/data-architecture/what-is-a-data-lake?utm_medium=organic) and bring database-like features to them. OTFs enable multiple data applications to work on the same data in a transactionally consistent manner.**_

Open table formats were designed to bring structure and governance to data lakes while solving common challenges like performance, consistency, and scalability. One of the primary features they bring is **ACID transactions**, which ensure reliable updates and deletes without needing to rewrite entire datasets. This eliminates the risk of job failures or inconsistent states, giving us the flexibility to safely modify data.

Additionally, **schema evolution** is a major advantage. Open table formats allow the schema to change over time — adding or removing columns — without breaking existing processes. This was a game-changer as our data structures evolved, and we needed the ability to adapt without causing downstream issues.

Another key feature is **time travel**, which lets you query historical versions of the data. This not only supports debugging but also helps with audits and compliance by allowing us to track data changes over time.

Finally, **partitioning and indexing** optimize query performance, making it faster and more efficient to access large datasets. With the ability to scale while maintaining consistency, open table formats help data lakes evolve from simple storage systems into powerful, dynamic platforms for modern data engineering.

# Comparing Iceberg and Delta Lake:

When diving into the world of **Open Table Formats**, the main contenders are **Delta Lake, Apache Iceberg, and Apache Hudi**. Each of these formats addresses the challenges of Big Data Engineering in its own unique way, with varying degrees of market support and adoption. In this article, I’ll focus on Delta and Iceberg, as I have limited experience with Hudi and haven’t encountered strong feedback that would compel me to explore it further.

Additionally, there are emerging projects like **Apache XTable**, which aim to rewrite metadata across multiple formats to provide greater flexibility for different ecosystems. I plan to explore XTable in a future discussion and how it fits within the broader data landscape.

Now, moving on to a comparison between **Delta Lake** and **Iceberg**:

![img-description](choosingAFormat.png)

The key differences between Delta Lake and Apache Iceberg lie in their design philosophy, performance optimizations, and feature sets. While both formats are designed to handle large-scale data workloads in data lakes, they excel in different areas depending on the use case.

| **Feature**                          | **Delta Lake**                                     | **Apache Iceberg**                                  |
| **Versioning & Time Travel**         | Transaction log-based versioning and time travel   | Snapshot-based versioning and flexible time travel  |
| **Partitioning**                     | Hive-style partitions (rigid)                      | Dynamic partition transforms (e.g., day, hour)      |
| **Schema Evolution**                 | Basic (add/rename columns)                         | Advanced (add, drop, rename, reorder columns)       |
| **ACID Transactions**                | Optimistic Concurrency Control                     | Snapshot-based ACID, multi-writer support           |
| **Performance Optimizations**        | Z-ordering, data skipping (Databricks-specific)    | Partition pruning, predicate pushdown               |
| **Engine Support**                   | Primarily Spark, support for Presto and Flink      | Engine-agnostic: Spark, Flink, Hive, Trino, Presto  |
| **File Format**                      | Parquet                                            | Parquet, ORC, Avro                                  |
| **Compaction & Data Management**     | Auto-compaction, optimized writes                  | Automatic metadata management, efficient file layout|
| **Adoption & Ecosystem**             | Strong in Databricks ecosystem                     | Widely adopted for multi-engine architectures       |


## Summary of Key Differences:

- **Versioning & Time Travel:** Delta Lake uses a **transaction log** for versioning, whereas Iceberg uses a **snapshot-based** system for more flexibility.
- **Partitioning:** Delta’s **Hive-style partitions** are more rigid, while Iceberg’s **dynamic partition transforms** allow better query performance.
- **Schema Evolution:** Delta supports basic schema changes, whereas Iceberg offers more **advanced schema evolution** (add, drop, rename, reorder columns).
- **ACID Transactions:** Delta uses **Optimistic Concurrency Control** while Iceberg focuses on a **snapshot-based ACID model**.
- **Performance:** Delta optimizes for **Z-ordering** and **data skipping**, but Iceberg excels with **partition pruning and predicate pushdown**.
- **Engine Support:** Delta is mainly for **Spark**, while Iceberg is engine-agnostic with support for **Spark, Flink, Trino, and more.**
- **Compaction:** Delta has **auto-compaction**, while Iceberg focuses on **efficient metadata management and file layouts**.
- **Adoption:** Delta is popular in Databricks, while Iceberg is more flexible across multi-engine environments.

The choice between Delta Lake and Iceberg depends on your specific needs. If you’re focused on Spark and Databricks, Delta might feel like a more natural fit. However, for multi-engine environments and greater flexibility in schema evolution, Iceberg is the better option.

As a Platform Engineer, I work in an organization where we utilize various data platforms for different use cases. Our goal is to centralize data access and control, and Iceberg seems to be the more useful option for this. While Iceberg currently lacks full Databricks support, it may gain more functionality in the future, especially after Databricks’ acquisition of Tabular. Databricks does provide limited functionality for Iceberg either through **UniForm** or **Native Spark** — though these are distinct approaches that yield different results.

Beyond Databricks, Iceberg integrates with Flink, Trino, Dremio, EMR, and other platforms, offering opportunities for centralized and ubiquitous access.

Certain features of Iceberg, such as storing metadata in a location completely independent of the data location, are particularly appealing when dealing with S3 throttling issues. Additionally, Iceberg’s partition transformations offer unique advantages that simplify many of our engineering tasks.