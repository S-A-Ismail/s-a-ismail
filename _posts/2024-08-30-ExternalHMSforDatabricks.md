---
title: External Hive Metastores on Databricks on AWS.
date: 2023-06-07 15:00:00 + 0000
categories: [Articles, Databricks]
tags: [aws, databricks, metastores, catalogs, hive-metastore, glue, unity catalog]     # TAG names should always be lowercase
author: ismail
toc: true
img_path: /assets/img/metastores-article/
---
Databricks has built-in support for the Hive Metastore (HMS), allowing for seamless integration and compatibility. It enables users to leverage existing Hive metadata and infrastructure within the Databricks environment. You have the option to bring your own existing metastore to Databricks.

Essentially all you have to do is add the right connection settings in a Clusters Spark Configurations.

> This article was originally written by me back in early 2023, Databricks Unity Catalog has matured over time, and unless DE teams are not using External HMS for migrating to Databricks, continuing to use External HMS would limit productivity while developing on Databricks as it might not support all the latest features that come with Unity Catalog.
{: .prompt-warning }

## Setting up External Hive Metastore on Databricks: ##

There are two ways to set this up, Local or Remote,

**Local mode**

- The metastore client running inside a cluster connects to the underlying metastore database directly via JDBC.

**Remote mode**

- Instead of connecting to the underlying database directly, the metastore client connects to a separate metastore service via the Thrift protocol. The metastore service connects to the underlying database.

> Note: When running a metastore in remote mode, DBFS is not supported.
{: .prompt-info }

This article focuses primarily on Local mode, For details on Remote mode click [here](https://docs.databricks.com/archive/external-metastores/external-hive-metastore.html).

### Pre-requisites: ###

- Ensure Hive Metastore Compatibility: Databricks supports integration with the Hive Metastore (HMS). Verify that your existing Hive metastore is compatible with the version of Databricks you are using.
- Also, ensure that Databricks clusters and Hive Metastore have network connectivity. Clusters run in a VPC, either have the metastore in the same VPC or peer the VPC it exists in with Databricks VPC.
- Set up an External Hive Metastore: If you already have an external HMS, configure it to work with Databricks. This involves setting the necessary connection parameters such as the metastore URI, database name, and credentials.

## Config Steps ##

Set the Spark Config settings on the Databricks cluster to point to the External Hive Metastore. The Spark configs should look like this:

> You may use cluster policies to standardize these settings
{: .prompt-info }

    
    spark.sql.hive.metastore.version <Compatible HMS Version>
    spark.hadoop.javax.jdo.option.ConnectionUserName <hive user>
    spark.hadoop.javax.jdo.option.ConnectionURL jdbc:postgresql://<hostname>:<host port>/databasename
    spark.hadoop.javax.jdo.option.ConnectionPassword {{secrets/HiveCredSecretScope/MetastoreCred}}
    spark.hadoop.javax.jdo.option.ConnectionDriverName org.postgresql.Driver
    spark.sql.hive.metastore.jars /databricks/hive_metastore_jars/*    
    

> **_Note:_** _The connection Driver can be MySQL, MariaDB, or PostgreSQL, depending on your external store._ 
{: .prompt-info }

-  Set `spark.sql.hive.metastore.version` to the version of your Hive metastore and `spark.sql.hive.metastore.jars` as follows:

    _"Hive 0.13: do not set `spark.sql.hive.metastore.jars`._

    _Hive 1.2.0 and 1.2.1 are not the built-in metastore on Databricks Runtime 7.0 and above. If you want to use Hive 1.2.0 or 1.2.1 with Databricks Runtime 7.0 and above, follow the procedure described in [Download the metastore jars and point to them](https://docs.databricks.com/archive/external-metastores/external-hive-metastore.html#download-the-metastore-jars-and-point-to-them)._

    _Hive 2.3.7 (Databricks Runtime 7.0–9.x) or Hive 2.3.9 (Databricks Runtime 10.0 and above): set `spark.sql.hive.metastore.jars` to `builtin`._

    _For all other Hive versions, Databricks recommends that you download the metastore JARs and set the configuration `spark.sql.hive.metastore.jars` to point to the downloaded JARs using the procedure described in [Download the metastore jars and point to them](https://docs.databricks.com/archive/external-metastores/external-hive-metastore.html#download-the-metastore-jars-and-point-to-them)."_

## Test the Connection: ##

Validate the connectivity between Databricks and the external Hive Metastore by running a simple Spark SQL query or accessing metadata information using the metastore.

```sql
SELECT * FROM schemaname.tablename LIMIT 10;
```

**_Your Connection has been established, Following are some post-connection operations you can verify._**

- Perform Metadata Operations: Once the connection is established, you can start performing metadata operations on Databricks. This includes creating databases, and tables, and managing metadata using Spark SQL or other supported APIs.
- Manage Access and Security: Configure access control and security settings for the Hive Metastore integration. Define appropriate permissions for users and groups to control access to metadata and ensure data governance. ACLs can be defined over Databricks directly provided no other ACL manager Ranger or IAM is blocking anything.
- Monitoring and Maintenance: Additionally, Regularly monitor the performance and health of the external Hive Metastore. Set up monitoring alerts to be notified of any issues or anomalies. Perform necessary maintenance tasks such as backups, upgrades, and optimizations as required.