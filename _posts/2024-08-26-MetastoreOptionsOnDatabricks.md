---
title: A Guide to Metastore Options on Databricks on AWS
date: 2024-08-26 14:24:14 + 0000
categories: [Articles, Databricks]
tags: [aws, databricks, metastores, catalogs, hive-metastore, glue, unity catalog]     # TAG names should always be lowercase
author: ismail
toc: true
img_path: /assets/img/metastores-article/
---
Databricks is a cloud-based data platform combining Apache Spark’s power with a collaborative workspace. It simplifies big data processing, analytics, and machine learning, enabling teams to work together seamlessly. With support for popular programming languages and scalable infrastructure, Databricks empowers organizations to extract actionable insights, streamline data workflows, and drive innovation.

One of the biggest hurdles faced by data-driven enterprises is managing and organizing this abundance of data effectively. This is where a metastore comes into play — a crucial component that holds the key to unlocking the full potential of data.

## What is a Metastore? ##
A metastore is a centralized repository that stores metadata information about the datasets, tables, partitions, schemas, and other structural and organizational elements of the data within the ecosystem. It acts as a catalog or directory that enables efficient data discovery, access, and management across the distributed environment.

Here are some key usages of a metastore in the big data ecosystem:

- Schema Management: It stores information about data schemas, making it easier to understand and work with the data.
- Data Cataloging and Discovery: It acts as a central catalog, allowing users to find and explore available datasets and tables.
- Query Optimization: Frameworks like Hive or Spark can use the metastore to optimize queries, improving performance by reducing unnecessary processing.
- Partitioning and Data Organization: The metastore tracks partitioning schemes, enabling efficient data pruning and query performance improvements.
- Data Lineage and Auditing: It captures data lineage information, helping to understand data origins and supporting auditing and compliance requirements.
- Integration with Multiple Systems: The metastore serves as a common repository, facilitating interoperability between different data processing and storage systems.

## Metastore Catalog options for Databricks on AWS ##
Databricks offers various metastore options to help you effectively manage metadata. In this article, we will explore some of these options and discuss their benefits and use cases. In later articles, I will walk through setting up each of these catalogs.

![img-description](CatalogOptions.PNG)

### AWS Glue Data Catalog:###

The AWS Glue Data Catalog seamlessly integrates with Databricks, providing a centralized and consistent view of your data.

![img-description](GlueProsandCons.PNG)
_Pros and Cons of Using AWS Glue as a Metadata Catalog for Databricks_

Documented limitations at [Limitations](https://docs.databricks.com/archive/external-metastores/aws-glue-metastore.html#limitations)

### Hive Metastore Service:###

Another metastore option for Databricks on AWS is the Hive Metastore also called the HMS service. Hive is a data warehouse infrastructure built on top of Apache Hadoop, and its metastore component provides a relational database for storing metadata. HMS is used by default per workspace if no other metastore is configured.

Compatibility with HMS is native, no prior setup is needed. The simplicity of use is a driving factor for use, but it does have some limitations mentioned below.

![img-description](HMSProsandCons.PNG)
_Pros and Cons of Hive Metastore Service on Databricks_

## External Hive Metastore Service:##

Databricks on AWS also provides the flexibility to utilize an external Hive Metastore. This option allows you to leverage an existing Hive Metastore deployed on your own infrastructure or on AWS services like Amazon RDS or Amazon Aurora.

![img-description](EHMSProsandCons.PNG)
_Pros and Cons of using an External Metastore on Databricks._

## Unity Catalog:##

Databricks’s own latest solution to apparently all metastore problems. Specifically designed to enhance metadata management capabilities within the Databricks platform. It offers advanced features and benefits that streamline metadata organization, improve data discovery, and enable seamless collaboration among teams. With the Unity Catalog, Databricks users can efficiently manage and leverage metadata across their analytics workloads, accelerating data-driven insights and decision-making.

![img-description](UCProsandCons.PNG)
_Pros and Cons of Unity Catalog._

# Choosing the Right Metastore Option: #

When deciding on the appropriate metastore option for your Databricks on AWS environment, consider factors such as your existing infrastructure, data governance requirements, and integration needs with other AWS services. If you already have an AWS Glue Data Catalog or Hive Metastore, leveraging them may be a straightforward choice. However, if you require advanced capabilities like ACID transactions or time travel, Delta Lake can be a powerful solution.

**Scenarios:**

- A small single workspace just Databricks Platform HMS should be your go-to.
- Migrating from a Pre-existing On-prem platform, You can use utilize the external hive metastore since you are already managing it and it is central to all your infrastructure. This is also a good option in scenarios where other processing frameworks use your Metastore.
- Already have an AWS Glue footprint, Leverage Glue but still the Cons overweight the Pros. Again, a good option if other frameworks use the metastore. I’d suggest having a Policy and Instance Profile setup for Adhoc cases but migrating some metadata to HMS or Unity Catalog.
- With a Multi-Workspace/Multi Account architecture. Unity catalog no doubt is the go-to option providing a more seamless data sharing and access approach.