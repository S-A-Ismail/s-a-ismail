---
title: Databricks Observability and Overwatch
date: 2024-03-09 14:24:14 + 0000
categories: [Articles, Databricks]
tags: [aws, databricks, cloud, IAM, CloudFormation, observability, monitoring]     # TAG names should always be lowercase
author: ismail
toc: true
img_path: /assets/img/overwatch-article/
---
Hey there, Databricks enthusiasts! Welcome back to another exciting article, where we’ll be diving into the fascinating world of Observability on Databricks.

As we all know Databricks, our favorite Spark compute platform usually comes under a lot of compute workload which scales up and down and whatnot racking up huge bills. As cool as it is and with options to compartmentalize workloads over a few workspaces and into custom-tagged clusters, Databricks still lacks a somewhat central observability tool that can provide real-time analytics of usage. That being said, Databricks has detailed and definitive metrics monitoring capabilities that can provide observability stats.

**The following are some details that are monitored and logged by Databricks:**

- Cluster Metrics: Monitoring various metrics related to cluster performance, such as CPU utilization, memory usage, network I/O, and storage.
- Jobs Monitoring: Monitoring scheduled jobs, their run history, execution times, and resource utilization.
- Notebook Execution Metrics: Tracking metrics for individual notebook executions, including execution time, data read/write, and memory usage.
- Logging and Metrics Export: Exporting logs and metrics to external systems like Amazon S3, Azure Blob Storage, or Elasticsearch for custom analysis and integration with third-party monitoring tools.
- Integration with APM Tools: Integrating with Application Performance Monitoring (APM) tools like Datadog or New Relic to gain deeper insights into Databricks performance alongside other applications and services.
- SQL Analytics Monitoring: Monitoring query performance and resource utilization in Databricks SQL Analytics.

The main use of this data is to provide visibility for Audit and Billing purposes. Billing on Databricks is on a pay-as-you-go basis in terms of Databricks Units (DBU). DBUs represent the consumption of compute resources on the platform.

# Here’s how DBUs and cloud costs are related in Databricks #

- DBUs and Clusters: When you create and use clusters in Databricks, the number, and size of the nodes in the cluster, as well as the duration the cluster is active, determine the DBU consumption. Larger and more powerful clusters typically consume more DBUs and incur higher costs.
- DBUs and Job Execution: Running jobs, such as notebooks or data processing tasks, also consumes DBUs. The complexity and resource requirements of the job impact the number of DBUs consumed during execution, affecting the associated cost.
- DBUs and Workspace Activities: Activities in the Databricks workspace, such as notebook runs and library installations, contribute to DBU consumption. These activities, when performed, consume DBUs and may incur costs.
- DBUs and Storage: While DBUs are primarily related to compute resources, the amount of data stored in DBFS or cloud storage can also affect the overall cost. More data stored may lead to additional storage costs.

# Cloud Costs: #

In addition to DBUs, Databricks runs on cloud infrastructure provided by cloud service providers like Amazon Web Services (AWS) or Microsoft Azure. The cloud cost associated with using Databricks includes charges for the cloud resources consumed, such as virtual machines, storage, and data egress.

Managing DBUs efficiently is crucial for optimizing cloud costs. By optimizing cluster configurations, job execution, and resource usage, users can minimize DBU consumption and, consequently, reduce cloud costs. Databricks provides users with visibility into their DBU consumption and associated cloud costs through the billing and usage reports in the Databricks workspace. This information empowers users to monitor and control their resource usage effectively, helping them make informed decisions to optimize costs while utilizing the platform’s capabilities to their advantage.

**_Okay, I went ahead and listed out how Databricks provides such good observability while mentioning there is no centralized platform observability in the beginning 😅😅😅. So here’s why, both are true, Databricks is technically still developing and it comes out with newer and improved features very often. As of now Databricks does have the capability to provide these details but the features to make efficient use of it are still a burden to developers and administrators. That is, it logs the usage but does not directly provide APM capabilities for efficient visuals._**

# Options for Observability #

Here’s where I tell you about my experience with Databricks, Observability, and Application performance management software (APMs).

![img-description](APMs.png)
_Some APMs under consideration_

Two of the main APMs are New Relic and Datadog, these are mature tools in platform observability and span across different platforms excluding Databricks hence they have their Pros. Easier to use and dashboard but since these are a different vendor completely will cost you more too.

Apart from those we have the very new Databricks system and billing tables that use Unity Catalog with a project called DBDemos.

Through Delta Sharing, Databricks Unity Catalog offers direct access to many of the lakehouse activity logs exposed in Delta as System Tables. This works on the basis that System Tables are the cornerstone of lakehouse observability and enable at-scale operational intelligence on numerous key business questions. Unity Catalog System Tables can be used to:

- Monitor your consumption and leverage the lakehouse AI capabilities to forecast your future usage, triggering alerts when billing goes above your criteria
- Monitor access to your data assets
- Monitor and understand your platform usage

_To be honest, this approach although owned by Databricks themselves is new and I haven’t personally tested it so can’t really comment at the moment,_ **_which brings me to the last Observability option that I have worked on which is Overwatch._**

# What is Overwatch? #

Overwatch is an in-progress project by Databricks Labs and is pretty much open-source as of now. It’s free, and though it requires some manual efforts at the end through dashboarding results, it also provides a huge degree of freedom in terms of answering business and platform insights through Data.

Overwatch is an open-source ETL pipeline developed by Databricks that takes parameters from us — Databricks administrators, as a config file and runs its job picking up logs and raw data and transforming them into processed tabular data. It’s limited to only Databricks as a platform but it spans across workspaces with users having complete control of which workspace to include/exclude in the dataset.

![img-description](generic_overwatch_arch.png)
_High-level Overwatch working diagram reference: [Overwatch AWS/GCP](https://databrickslabs.github.io/overwatch/deployoverwatch/cloudinfra/aws/)_

The only cost Overwatch incurs is the cost of the job running on the Databricks cluster this is a huge monetary benefit when going for Overwatch.

Official Documentation: [Overwatch](https://databrickslabs.github.io/overwatch/)

Since there isn’t much out there for Overwatch enablement, I will spend the rest of this article explaining how to enable Overwatch.

# My Implementation #

## Assumptions: ##

- We are working with Databricks on AWS
- Let’s assume a multi-workspace architecture running 2 workspaces in AWS Account A and 2 in AWS Account B.
- You have the necessary Admin/IAM privileges in both AWS and Databricks.

## Terminologies: ##

- Driver Workspace: The workspace hosting the Overwatch Cluster and Job.
- Remote Workspace: The workspace(s) that are subject of the Overwatch Job but don’t run the Overwatch Job

## Assumed Architecture: ##

- Let’s assume AWS Account A is the driver workspace account. For simplicity, we will keep the Audit and Billing Logs in this account only, although they can reside in other accounts.
- The account console logs Audit and Billing Logs into the respective bucket.
- The clusters log their respective driver, executor logs into the respective workspace buckets.
- The Overwatch cluster will pick up logs as raw data from the locations process them and then store the results in delta table format into the landing bucket.

![img-description](LogCollectionFlow.png)
_Logging Flow_

![img-description](JobFlowArch.png)
_Job flow architecture_

## Pre-requisites: ##

### **Pre-Req1:** ### 

Creation of the necessary S3 buckets for log collection and processing data landing zones. Since this isn’t Databricks-specific, I won’t go into details. Once buckets are created continue forward.

### **Pre-Req2:** ### 

Each cluster policy in each workspace is to have an argument that sets the cluster logging configuration.

Add the following in _**EACH AND EVERY CLUSTER POLICY IN ALL WORKSPACES**_, _where_ _**<S3 BUCKET PATH>**_ _is to be replaced by the actual logging bucket path._

```json
"cluster_log_conf.path": {
    "type": "fixed",
    "value": "<S3 BUCKET PATH>"
  },
"cluster_log_conf.type": {
    "type": "fixed",
    "value": "S3"
  },
"cluster_log_conf.region": {
    "type": "fixed",
    "value": "us-east-1"
  }
```

### **Pre-Req3:** ###

Each Instance profile in each workspace needs to have Read/Write access to the logging buckets to write cluster logs.

_An easy way to handle that is to create a managed policy from CFN and attach it to all Instance profiles._ Here’s a sample for the CFN script just in case 😉,

```json
{
  "Type" : "AWS::IAM::ManagedPolicy",
  "Properties" : {
      "Description" : "Instance profile access too Cluster Logging Buckets",
      "ManagedPolicyName" : "overwatch-cluster-logging-policy",
      "PolicyDocument" :
            {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Action": [
                            "s3:List*",
                            "s3:Get*",
                            "s3:Put*",
                            "s3:DeleteObject"
                        ],
                        "Resource": [
                            "arn:aws:s3:::<cluster-logging-bucket1>",
                            "arn:aws:s3:::<cluster-logging-bucket1>/*",
                            "arn:aws:s3:::<cluster-logging-bucket2>",
                            "arn:aws:s3:::<cluster-logging-bucket2>/*"

                        ],
                        "Effect": "Allow"
                    }
                ]
            },
      "Roles" : [ 
                    "<instance profile rolename 1>",
                    "<instance profile rolename 2>"
                ]
    }
}
```

__*Note: You will have to run the above CFN stack in both AWS accounts. You will have to enter bucket and cluster instance profile names manually 😢.*__

### **Pre-Req4:** Enabling billing and audit logs. ###

Audit and billing logs can be configured simply by a log delivery API call when you have a role with access to the audit logging bucket. The method is defined in detail in Databricks’s documentation, [Configure the Log delivery API](https://docs.databricks.com/en/administration-guide/account-settings/audit-log-delivery.html).

For billing logs the method is quite similar and documented here, [Configure Billing Logs](https://docs.databricks.com/en/administration-guide/account-settings/billable-usage-delivery.html)

### **Pre-Req5:** Creating PAT tokens for the Job. ###

The PAT tokens are used by the Job to access resources from each workspace. All we have to do is use an admin user from each workspace and create a non-expiring PAT token. The process is pretty straightforward.

These tokens will have to be added as secrets in the driver workspace. The normal way to do so is to create a scope named say “OverwatchSecrets” and secrets inside it corresponding to workspace names “workspace<N>”.

#### Creating Secrets and Scopes: ####

- Have the Databricks CLI installed in your terminal.
(As simple as **pip install databricks-cli**)
- Authenticate into the CLI using an extra PAT token from the driver workspace. (This one can expire):
```
databricks configure –-token
```

- Enter the host URL as asked for, and then enter the - - PAT token and you will have authenticated into the CLI.
- Create the Scope:
```
databricks secrets create-scope - scope OverwatchSecrets
```
- Create Secrets:
```
databricks secrets put --scope OverwatchSecrets --key Workspace1
```

    _This will open up a prompt for adding the secret value, follow the steps as mentioned in this link, [Secrets](https://docs.databricks.com/en/security/secrets/secrets.html)_

- **_Repeat the above step for each Workspaces token._**

### **Pre-Req6:** Creating the Overwatch Cluster Instance Profile ###

The Overwatch cluster instance profile needs Read access to the logging buckets and full access to the landing bucket.

The following CFN script creates the profile and all you have to do is import it into your driver workspace.

```json
{
    "AWSTemplateFormatVersion": "2010-09-09",
    "Description": "Provision IAM role for deploying overwatch cluster",
    "Parameters" : {
        "RoleName" : {
            "Type" : "String",
            "Default" : "databricks-overwatch-cluster-role",
            "Description" : "Enter rolename for your cluster"
        },
        "PolicyName" : {
            "Type" : "String",
            "Default" : "overwatch-cluster-logging-policy",
            "Description" : "Enter managed policy NAME for logging you create in earlier step"
        }
    },
    "Resources": {
        "DatabricksOverwatchInstanceRole": {
            "Type": "AWS::IAM::Role",
            "Properties": {
                "RoleName": { "Ref" : "RoleName" },
                "AssumeRolePolicyDocument": {
                    "Version": "2012-10-17",
                    "Statement": [
                        {
                            "Effect": "Allow",
                            "Principal": {
                                "Service": "ec2.amazonaws.com"
                            },
                            "Action": "sts:AssumeRole"
                        }
                    ]
                },
                "ManagedPolicyArns": [
                    {"Fn::Join": [ "",[ "arn:aws:iam::${AWS::AccountId}:policy/", { "Ref" : "PolicyName" }] ] }
                ],
                "Policies": [
                    {
                        "PolicyName": "databricks-workspace-overwatch-job-s3Access",
                        "PolicyDocument": {
                            "Version": "2012-10-17",
                            "Statement": [
                                {
                                    "Effect": "Allow",
                                    "Action": [
                                        "s3:List*",
                                        "s3:Get*"
                                    ],
                                    "Resource": [
                                        "arn:aws:s3:::<databricks-cluster-logging-bucket1>",
                                        "arn:aws:s3:::<databricks-cluster-logging-bucket2>",
                                        "arn:aws:s3:::<databricks-cluster-logging-bucket3>",
                                        "arn:aws:s3:::<databricks-cluster-logging-bucket4>",
                                        "arn:aws:s3:::<databricks-audit-billing-log-bucket>",
                                        "arn:aws:s3:::<databricks-cluster-logging-bucket1>/*",
                                        "arn:aws:s3:::<databricks-cluster-logging-bucket2>/*",
                                        "arn:aws:s3:::<databricks-cluster-logging-bucket3>/*",
                                        "arn:aws:s3:::<databricks-cluster-logging-bucket4>/*",
                                        "arn:aws:s3:::<databricks-audit-billing-log-bucket>/*"
                                    ]
                                },
                                {
                                    "Action": [
                                        "s3:List*",
                                        "s3:Get*",
                                        "s3:Put*",
                                        "s3:DeleteObject"
                                    ],
                                    "Resource": [
                                        "arn:aws:s3:::databricks-overwatch-landing-bucket",
                                        "arn:aws:s3:::databricks-overwatch-landing-bucket/*"
                                    ],
                                    "Effect": "Allow"
                                }
                            ]
                        }
                    }
                ]
            }
        },
        "InstanceProfile": {
            "Type": "AWS::IAM::InstanceProfile",
            "Properties": {
                "Path": "/",
                "Roles": [
                    {
                        "Ref": "DatabricksOverwatchInstanceRole"
                    }
                ]
            }
        }
    }
}
```

**_Since some cluster logging buckets are in a separate account, we will have to go and add the following to the bucket policy to allow our cluster to gain read access,_**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::<account a>:role/<your overwatch cluster instance role name>"
            },
            "Action": [
                "s3:List*",
                "s3:Get*"
            ],
            "Resource": [
                "arn:aws:s3:::<account-b-cluster-logging-bucket>",
                "arn:aws:s3:::<account-b-cluster-logging-bucket>/*"
            ]
        }
    ]
}
```
### **Pre-Req7:** Working with the Config File:

- For complete official documented details and the sample config file please check out the official page, [Configure-Overwatch](https://databrickslabs.github.io/overwatch/deployoverwatch/configureoverwatch/configuration/)
- Overwatch deployment is driven by a configuration file which will ultimately be loaded into the deployment as a CSV format. This CSV file will contain all the necessary details to perform the deployment.
- **I would recommend using Excel to edit the CSV file,** note that Excel may alter several pieces of the CSV; thus we recommend you **complete all your edits in the .xlsx** file and then save it as a .csv extension.
- Make sure you import all the data from the CSV into Excel as **Text**, and Workspace ID are large numbers that Excel rounds up (We don’t want that)
- For any column unsure of, leave it empty or default. The file has some configs that are solely for Azure which we can ignore, If your organization has cost presets you may define them or else let the stay as default.
- The database for an Overwatch Job remains the same for each Workspace. The ETL database holds the Bronze, Silver, and Gold Table Data and the Consumer Database holds views of the Gold Data. Choose a Database name and set the same for each job. For example **ow_etl_dev** and **ow_consumer_dev**
- Don’t worry about defining cluster logging locations, The Job will figure those out themselves, provided there are less than 50 logging locations per workspace, which is our case.
- Create just one S3 landing bucket for a pipeline, the Overwatch Job will segregate/partition the data itself. i.e. for landing locations, just mention the bucket name and root folder, **_(If it's a dedicated bucket)_**
- “Active” True or False config in Config file, True signifies, that the Overwatch job will work on the said workspace. False, signifies that the job won’t run for the said workspace. For ease of use, always keep the driver workspace at the top.
- The driver workspace has to be a part of the Config file. If its audit data is not necessary. Mark it as False.
- API URLs for Workspaces. The following command returns the API for each workspace when run on a notebook in that workspace.

```scala
%scala
dbutils.notebook.getContext().apiUrl.get
```
- The remaining configurations are pretty much self-explanatory, so will pass on them, please check the official website for the sample file.

I guess this sets it for the Prerequisites, next up is running the Job.

## Running the Overwatch Job ##

Running the Job have to methods, the Notebook and the Job, starting off always test with the Notebook, as it helps with Validation, when everything is tested right, we may move to Job orchestration.

### Step 1: The Cluster ###

As per the documentation, [Cluster Config](https://databrickslabs.github.io/overwatch/deployoverwatch/runningoverwatch/clusterconfig/), these are the optimal specs:

![img-description](clusterdetails.png)
_Overwatch Cluster Specs_

**_Note: A cluster may be kept auto-scaling from 2–4 nodes initially with historical workloads and then set to 2 nodes when the load catches up._**

### Step 2: Uploading the Config Files and Starter Run books ###

Create the [Config file](https://databrickslabs.github.io/overwatch/deployoverwatch/configureoverwatch/configuration/) and upload it to Databricks DBFS and download the Starter [notebook](https://databrickslabs.github.io/overwatch/deployoverwatch/runningoverwatch/notebook/) and upload to workspace too. **_(For starters, test it out on just the driver workspace, i.e. single workspace deployment)_**

Create an Overwatch Folder in the DBFS File store in the driver workspace. Add the 071x_Runner.dbc in the Workspace and the CSV in FileStore as shown below:

![img-description](uploadnotebooks.png)
_Uploading relevant notebooks to your driver workspace for easy access_

![img-description](uploadconfigfiles.png)
_Uploading the Config files_

**_Note: Copy the path for the uploaded file, this will be used in the Notebook._**

### Step 3: Testing success on Notebook, the interactive nature of running on Notebooks allows you to debug the config file if the need arises. ###

- Open the Runner Notebook on Databricks, and ensure that it is connected to the Overwatch Cluster.
- You only need to edit the following block:

![img-description](editfollowing block new.png)

- Add the path to CSV you copied in the previous step to the PATHTOCSVCONFIG variable here, and keep PARALLELISM equal to the number of workspaces that it will be deployed on.
- **_Note: Parallelism is the number of workspaces. The default parallelism value would be 4 but set it up to be the same as the number of workspaces included in the Job._**

### Step 4: Validation

You may now sequentially run the cells. The cells will validate inputs and the configurations and one of the cells will deploy the pipeline.

**_For a single workspace, the pipeline takes around 30 minutes to execute._**

Input Validation:

![img-description](input_validation.png)

Pipeline Validation:

![img-description](pipeline_validation.png)

Deployement:

![img-description](deployement.png)

### Step 5: Outputs

The outputs would look like this:

![img-description](outputs.png)

### Step 6: Multiple Workspace deployment, use an updated config file, with Configs from each workspace.

Repeat steps 1 to 5 with the new config file. The difference between these two deployments is only the number of workspaces.

**Note:**

- **_Driver workspace should be at the top of the config file and must be in the config file._**
- **_Mark the active config as false in this config file if you don’t want to include the workspace in the job._**
- **_The database, landing location, and secret scope are the same for each workspace. The secrets will be different and PAT to be generated from the target workspace._**
- **_This will take longer than a single workspace deployment. Around 2 hours for 4 workspaces, depending on the historical workloads._**

## Orchestrating the Overwatch Job ##

Once we have it up and running all we have to do is orchestrate it for regular intervals to load in newer data. This section will walk us through that.

The Overwatch pipeline is recommended to run once a day. When the workspace has a minimal load.

One pipeline job can run all three bronze, silver, and gold. ETL database will have all tables, consumer database has only Views of the Gold data.

### How to set up Orchestration? ###

#### Step 1: Go to Workflows in Databricks, Click on the “Create Job” button. ####

![img-description](workflows.png)

#### Step 2: On the resulting page, ####

![img-description](jobdetails.png)

Enter the details as follows,

![img-description](jobdetails2.png)

It should end up looking like this, 

![img-description](jobdetails3.png)

#### Step 3: Job Cluster Specs: (Same as the all-purpose cluster) ####

![img-description](jobclusterspecs.png)

#### Step 4: Once set, click Create and Create Job in the Dialog box, ####

![img-description](jobfinal.png)

#### Step 5: Workflow UI ####

![img-description](workflowui.png)

You can schedule for once a day from the UI only. The job can be triggered by the schedule or the manual “Run now” button.

By now, you have a running Overwatch pipeline bringing you your Databricks environments observability data. This data as shown above is inside Databricks HMS service and can be used either within Databricks to create observability dashboards, Or we could take advantage of the Delta format and view the datasets in either Athena or some other Cataloging tool.

This article was focused more on setting up the pipeline, In future articles I will go more into what we can build in terms of observability in Databricks.