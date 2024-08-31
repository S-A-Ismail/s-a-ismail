---
title: Unity Catalog as a Databricks Hive Metastore
date: 2024-08-30 15:00:00 + 0000
categories: [Articles, Databricks]
tags: [aws, databricks, metastores, catalogs, hive-metastore, glue, unity catalog]     # TAG names should always be lowercase
author: ismail
toc: true
img_path: /assets/img/metastores-article/
---
So this is the last of the articles on metastores on Databricks. We’ve covered all the legacy metastores, External HMS, Glue, and HMS. Unity Catalog as mentioned earlier, is Databricks’s latest solution to metastore problems.

Unity Catalog is a cutting-edge metastore service provided by Databricks, specifically designed to enhance metadata management capabilities within the Databricks platform. It offers advanced features and benefits that streamline metadata organization, improve data discovery, and enable seamless team collaboration.

This article will focus more on enabling Unity Catalog on your Databricks on AWS.

### Pre-requisites and Assumptions: ###
- You are a Databricks account admin.
- You have access to create IAM and S3 resources on AWS.
- Your Databricks account must be on the Premium plan or above.
- CloudFormation access is preferable for easier deployments.
- We are not using KMS for now.

## Logical Architecture: ##

Logical Architecture would be something like this:

![img-description](UCLogicalArchitecture.PNG)
_Unity Catalog implementation logical architecture._

### Step 1: Create a metastore###

A metastore is the top-level container of objects in Unity Catalog. It stores metadata about data assets (tables and views) and the permissions that govern access to them. You must create a metastore for each region in which your organization operates.

**_Note: You can only have 1 metastore per region and that needs to be shared by all workspaces in that region for that Databricks Account._**

**Configure a storage bucket and IAM role in AWS (Cloud Resources).**

This bucket will store all of the metastore’s metadata and managed tables, except those that are in a catalog or schema with their own managed storage location.

The IAM role will enable access from Unity Catalog to your storage buckets and external locations through Databricks.

**When you create the bucket:**

- Create it in the same region as the workspaces you will use to access the data.
- Use a dedicated S3 bucket for each metastore that you create.
- Do not allow direct user access to the bucket.

The Databricks documentation [Configure a storage bucket and IAM role in AWS](https://docs.databricks.com/data-governance/unity-catalog/get-started.html#cloud-tenant-setup-aws). mentions in great detail how to do this via console.

I have created a simplified CFN template to run the same, this template can be used to generate the metastore root buckets and IAM and also further catalog root buckets. All you need to do is add the bucket name, IAM role name, and your Databricks account ID as parameters.

**_Note: If you will need to edit the CFN to add your specific S3 whitelists and Tag key-value pairs._**

The CFN runs as a two-step process. Once you’ve added your Tags and S3 buckets, run the following CFN to create the stack.

    ```json
    {
        "AWSTemplateFormatVersion": "2010-09-09",
        "Description": "Provision cloud resources resources to create databricks unity catalog metastore",
        "Parameters" : {
        "RoleName" : {
                "Type" : "String",
                "Default" : "databricks-unity-catalog-sc-role",
                "Description" : "Enter rolename for your sc role"
            },
        "BucketName": {
            "Type" : "String",
                "Default" : "databricks-unity-catalog-root-storage-bucket",
                "Description" : "Enter bucketname for your root bucket"
            },
        "DatabricksAccountID": {
            "Type" : "String",
                "Default" : "",
                "Description" : "Enter your databricks Account ID"
            }
        },
        "Resources": {
            "RootBucket": {
            "Type": "AWS::S3::Bucket",
            "Properties": {
                "BucketName":{ "Ref" : "BucketName" },
                "BucketEncryption": {
                "ServerSideEncryptionConfiguration": [
                    {
                    "ServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                    }
                ]
                },
                "Tags": [
                {
                    "Key": "<Key1>",
                    "Value": "<Value1>"
                },
                {
                    "Key": "<Key2>",
                    "Value": "<Value2>"
                }
                ]
            }
        },
        "SecurityCredentialRole": {
            "Type": "AWS::IAM::Role",
            "Properties": {
                "RoleName": { "Ref" : "BucketName" },
                "AssumeRolePolicyDocument": {
                        "Version": "2012-10-17",
                        "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {
                            "AWS": [
                                "arn:aws:iam::414351767826:role/unity-catalog-prod-UCMasterRole-14S5ZJVKOTYTL"
                            ]
                            },
                            "Action": "sts:AssumeRole",
                            "Condition": {
                            "StringEquals": {
                                "sts:ExternalId": { "Ref" : "DatabricksAccountID" }
                            }
                            }
                        }
                        ]
                    },
                "Policies": [
                    {
                    "PolicyName": {"Fn::Join": [ "",[ { "Ref" : "RoleName" },"-s3Access"] ] },
                    "PolicyDocument": {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Action": [
                                "s3:GetObject",
                                "s3:PutObject",
                                "s3:DeleteObject",
                                "s3:ListBucket",
                                "s3:GetBucketLocation",
                                "s3:GetLifecycleConfiguration",
                                "s3:PutLifecycleConfiguration"
                            ],
                            "Resource": [
                                {"Fn::Join": [ "",["arn:aws:s3:::", { "Ref" : "BucketName" }]] },
                                {"Fn::Join": [ "",["arn:aws:s3:::", { "Ref" : "BucketName" },"/*"]] },
                                "arn:aws:s3:::<bucket1>/*",
                                "arn:aws:s3:::<bucket1>",
                                "arn:aws:s3:::<bucket2>/*",
                                "arn:aws:s3:::<bucket2>",
                                "arn:aws:s3:::<bucket3>/*",
                                "arn:aws:s3:::<bucket3>"
                                ],
                            "Effect": "Allow"
                        }
                    ]
                    }
                }
                ]
                }
            }   
        }
    }
    ```

Once the stack is up, Update the same stack to include the Self-Assuming part of the IAM Role. Just copy the following. **_This small addition would cause your stack to fail if it existed in the first run._**

    ```json
    {
        "AWSTemplateFormatVersion": "2010-09-09",
        "Description": "Provision cloud resources resources to create databricks unity catalog metastore",
        "Parameters" : {
        "RoleName" : {
                "Type" : "String",
                "Default" : "databricks-unity-catalog-sc-role",
                "Description" : "Enter rolename for your sc role"
            },
        "BucketName": {
            "Type" : "String",
                "Default" : "databricks-unity-catalog-root-storage-bucket",
                "Description" : "Enter bucketname for your root bucket"
            },
        "DatabricksAccountID": {
            "Type" : "String",
                "Default" : "",
                "Description" : "Enter your databricks Account ID"
            }
        },
        "Resources": {
            "RootBucket": {
            "Type": "AWS::S3::Bucket",
            "Properties": {
                "BucketName":{ "Ref" : "BucketName" },
                "BucketEncryption": {
                "ServerSideEncryptionConfiguration": [
                    {
                    "ServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                    }
                ]
                },
                "Tags": [
                {
                    "Key": "<Key1>",
                    "Value": "<Value1>"
                },
                {
                    "Key": "<Key2>",
                    "Value": "<Value2>"
                }
                ]
            }
        },
        "SecurityCredentialRole": {
            "Type": "AWS::IAM::Role",
            "Properties": {
                "RoleName": { "Ref" : "BucketName" },
                "AssumeRolePolicyDocument": {
                        "Version": "2012-10-17",
                        "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {
                            "AWS": [
                                "arn:aws:iam::414351767826:role/unity-catalog-prod-UCMasterRole-14S5ZJVKOTYTL",
                                {"Fn::Join":[""["arn:aws:iam::",{"Ref": "AWS::AccountId"},":role/",{"Ref": "RoleName"}]]}
                            ]
                            },
                            "Action": "sts:AssumeRole",
                            "Condition": {
                            "StringEquals": {
                                "sts:ExternalId": { "Ref" : "DatabricksAccountID" }
                            }
                            }
                        }
                        ]
                    },
                "Policies": [
                    {
                    "PolicyName": {"Fn::Join": [ "",[ { "Ref" : "RoleName" },"-s3Access"] ] },
                    "PolicyDocument": {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Action": [
                                "s3:GetObject",
                                "s3:PutObject",
                                "s3:DeleteObject",
                                "s3:ListBucket",
                                "s3:GetBucketLocation",
                                "s3:GetLifecycleConfiguration",
                                "s3:PutLifecycleConfiguration"
                            ],
                            "Resource": [
                                {"Fn::Join": [ "",["arn:aws:s3:::", { "Ref" : "BucketName" }]] },
                                {"Fn::Join": [ "",["arn:aws:s3:::", { "Ref" : "BucketName" },"/*"]] },
                                "arn:aws:s3:::<bucket1>/*",
                                "arn:aws:s3:::<bucket1>",
                                "arn:aws:s3:::<bucket2>/*",
                                "arn:aws:s3:::<bucket2>",
                                "arn:aws:s3:::<bucket3>/*",
                                "arn:aws:s3:::<bucket3>"
                                ],
                            "Effect": "Allow"
                        }
                    ]
                    }
                }
                ]
                }
            }   
        }
    }
    ```

This successful second run should create all the required cloud resources for metastore creation.

**_Note: The same stack can be used for catalog-level resource creation too. Say you have a multi-AWS account or Multi-Workspace architecture and you want to segregate root buckets and ACLs for each catalog. You may go ahead and deploy the same stack with different resource names as required and use them on the catalog level._**

**Creating the Metastore:**

- Log in to the Databricks [account console](https://accounts.cloud.databricks.com/).
- Click on the Data Icon
- Click Create Metastore.
- Enter a name for the metastore.
- Enter the region where the metastore will be deployed. Note: This must be the same region as the workspaces you want to use to access the data. Make sure that this matches the region of the cloud storage bucket you created earlier.
- Enter the S3 bucket path and IAM role name that you created above.
- Click Create.
- When prompted, select workspaces to link to the metastore.

## Enabling Unity Catalog on Workspaces: ##

Once a metastore is created and attached to workspaces, you will get a prompt to confirm enabling Unity Catalog on the workspace. It will guide you to consider the change in User provisioning and Admin rights and also that this is an irreversible action. If you agree, you may confirm and enable Unity Catalog.

You may also come back to the account console and select the metastore and then the “Assign to a Workspace” option to include more workspaces.

And the last way to enable UC on a workspace is while workspace creation, assign the metastore to the workspace while workspace creation, and you should be good to go.

**Considerations after UC Enablement:**

- Most operations are limited by privilege, it is advisable to create a local group in the account console with the admin users and keep that group as the Metastore admin.
- Object ownership needs to be clearly defined or else some operations might fail.
- Access provisioning should point to the Account console. If you use SCIM provisioning it should point to the Account console so that UC can view the users.
- Clusters need to be single-user or shared and have DBR 13.0 or above. No Isolation clusters won’t work with UC.
- The code would require to be updated with the three namespaces. <catalog>.<schema>.<table/view>
- Two namespace codes by default will use HMS but that can be changed from a cluster policy (Not recommended). If needed please add this spark configuration.

    ```sh
    spark.databricks.sql.initial.catalog.name <catalog_name>
    ```

**Creating a Catalog:**

- You may optionally need root cloud resources. Depends on your organizational and data architecture and ACL policies. If required, you can create new root resources from the CFN Script.
- Once they are created you may create the catalog either from the workspace UI from the Data Tab, or use SQL/Python scripts.
- Heres a sample SQL script to be run on a SQL Warehouse or DBR 13 or later cluster:

    ```sql
    CREATE CATALOG [ IF NOT EXISTS ] <catalog-name>
   [ MANAGED LOCATION '<location-path>' ]
   [ COMMENT <comment> ];
    ```
_Where the location-path is the root s3 bucket, where all the managed table data is held. If not, defined UC will store this data in the metastores root s3 bucket._

Catalogs can then be limited to a single workspace (Optional) and assigned privileges as required. More here, [Unity Catalog privileges and securable objects](https://docs.databricks.com/data-governance/unity-catalog/manage-privileges/privileges.html).

Post catalog creation, are schema and tables creation very well defined in Databricks’s own documentation.

- [Create and Manage Schemas in Unity Catalog](https://docs.databricks.com/data-governance/unity-catalog/create-schemas.html#language-SQL)
- [Create and Manage Tables in Unity Catalog](https://docs.databricks.com/data-governance/unity-catalog/create-tables.html)

For simplicity sake, say we can create schemas just as we did in HMS but using the three namespace approach. A more, interesting topic is upgrading tables to Unity Catalog.

## Upgrading Tables to Unity Catalog:##

Again, Databricks’s own documentation handles it in great detail here, [Migrate Tables](https://docs.databricks.com/data-governance/unity-catalog/migrate.html) but here's my take on it.

- You can either use the UI option to migrate tables and schemas. Its pretty self explainatory after the documentation. Choose the schema to upgrade and it will show you the upgrade option and then walk you through the migration.
- Again, you need a SQL Warehouse or a DBR 13 cluster for migration. SQL Warehouses can generate migration queries too. But SQL Warehouses are a bit more expensive and for larger number of tables you might need a big warehouse at least temporarily.
- If you plan to upgrade more than 20 tables from the UI at a time you cannot use an All-purpose cluster for it “You will need a SQL Warehouse”
- My work around for this is to generate your own table upgrade queries through code and sequentially run on a Notebook rather than use the UI wizard.
    The table upgrade uses a CREATE TABLE LIKE statement:
    ```sql
    CREATE TABLE [ IF NOT EXISTS ] catalog_name.schema_name.table_name LIKE hive_metastore.schema_name.source_table_name [table_clauses]
    ```
- The UI upgrade wizard adds a table property to the source table that signifies that the table has already been migrated. If for some reason, **_you drop an upgraded table and try to migrate it again from the UI it won’t work as it would see the upgraded property on the source table. For this you can manually run the above query for upgrade._**
- Unity Catalog doesn't allow Managed table migration from the UI. In order to migrate managed tables, You have to run a CTAS Statement.
    ```sql
    CREATE TABLE <catalog>.<new-schema>.<new-table>
    AS SELECT * FROM hive_metastore.<old-schema>.<old-table>;
    ```
- Lastly, we can also make use of the [SYNC](https://docs.databricks.com/sql/language-manual/sql-ref-syntax-aux-sync.html) command for as long as we run HMS and UC in parallel. The SYNC command synchronizes the changes from HMS to UC if the table is already created.
    ```sql
    SYNC { SCHEMA target_schema FROM source_schema |
        TABLE target_table FROM source_table }
        [SET OWNER principal]
        [DRY RUN]
    ```