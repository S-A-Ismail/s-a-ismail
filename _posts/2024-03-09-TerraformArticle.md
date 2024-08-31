---
title: Creating resources in multiple AWS accounts using Terraform
date: 2023-09-20 14:24:14 + 0000
categories: [Articles, DevOps]
tags: [aws, terraform, cloud, IAM, CloudFormation]     # TAG names should always be lowercase
author: ismail
toc: false
img_path: /assets/img/terraform-article/
---

As a beginner when I was creating my first terraform code, I created an EC2 instance with a role attached that had the necessary IAM privileges. This kind of made it easy for me to not expose any keys or go into too many configurations when setting up the provider.

```tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"
}
```

Now it worked all well and good (OK after a lot of debugging 😅🤣) in the required account, but life can’t be that easy now, can it?😅🤣

I soon got the task of expanding and parameterizing my code to scripts to deploy resources in multiple accounts. Now this may come as a no-brainer to expert cloud and terraform engineers but it was a bit out of the box for me at that time.

As any developer, I went to Google and Stack Overflow for help and either I didn’t phrase my problem correctly or there wasn’t anyone with a similar issue out there, and I did not find a good solution with an explanation for it. Writing this article for future junior Terraform developers if they ever come across a similar problem.

So what’s the problem statement?

    We need to deploy resources into multiple AWS accounts.
    How do we set up authentication?
    If we set up authentication to each account how do we tell Terraform which account to deploy in?

The easiest way I did come across was using Access Keys from the accounts and setup provider according to those, but as I mentioned earlier, life isn’t as easy as we expect, our company had an SCP against having IAM users so creating those permanent keys was also out of question.

Here’s how you could do it though, Deploying to Multiple AWS Accounts, and here’s one way to use those multiple accounts How to use multiple AWS providers shout outs to the authors 🙌🙌.

For my use case, I had to set up cross-account roles that my instance profile could assume in order to deploy those resources. Moving forward, I will be discussing the step-by-step process of creating this cross-account setup.

**Assumptions:**
- Let’s assume we have 3 AWS accounts A, B, and C.
- Our Instance lies in Account A.
- We have privileges to create and update IAM roles in each account.

**Pre-Requisites:**
- Create an IAM role in each account with a policy that defines the privileges it would need to deploy all terraform resources.
- Create an Instance in Account A with the role attached as an Instance Profile.

**What would it look like?**

The roles in Accounts B and C would have a trust relationship allowing the role in Account A to assume them, The Role in Account A will have a policy allowing it to assume roles in Accounts B and C.

![img-description](Terraform Article Architecture.png)
_Assume role in action or something 😅🤣_

__Setting up the roles:__

Add the following assume role policy statement in the roles from both Accounts B and C:

```json
"AssumeRolePolicyDocument": {
 "Version": "2012-10-17",
 "Statement": [
  {
   "Effect": "Allow",
   "Principal": {
    "AWS": [
       " arn:aws:iam::<account_a_id>:role/<account a role>"
    ]
   },
   "Action": [
    "sts:AssumeRole"
   ]
  }
 ]
}
```

Add the following policy to the role in Account A:

```json
"Statement": [
  {
   "Effect": "Allow",
   "Resource": [
      " arn:aws:iam::<account_b_id>:role/<account b role>",
      " arn:aws:iam::<account_c_id>:role/<account c role>"

    ]
   "Action": [
    "sts:AssumeRole"
   ]
  }
 ]
```

__We would configure the provider as follows now,__

```tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"
  assume_role {
     role_arn = var.iam_role_map[var.account_name]
 }
}

# Define variable iam_role_map and account_name

variable iam_role_map {
   account_a = " arn:aws:iam::<account_a_id>:role/<account a role>"
   account_b = " arn:aws:iam::<account_b_id>:role/<account b role>"
   account_c = " arn:aws:iam::<account_c_id>:role/<account c role>"
}

variable account_name {}
```

This solves our authentication issue, the next question is how do we get Terraform to deploy in a specific account?

Since our provider is now defined as a variable every time we run the Terraform plan or apply commands it will ask us for the account_name, make sure to type in the same name as in the keys for iam_role_map and Terraform will assume the role for that account. You can also provide the variable value as an argument along with the plan and apply commands for non-interactive use cases like this:

```bash
terraform plan -var "account_name=account_a"
terraform apply -var "account_name=account_a"
```

In Terraform we cannot script which AWS account to use, Terraform automatically only deploys to the account whose role it’s assumed or whose keys it’s accessing.

I hope I didn’t go overstate the obvious here 😢, but this took me a while to wrap my head around so I just wanted to provide a short tutorial for others.

Let me know if there is a better way, always open to suggestions

_Note: I haven’t taken into account if I wanted to deploy in multiple accounts simultaneously over here, in that regard I assume we would need to employ the count command and set up multiple providers like in linked documents, I’ll write on it next time 😉._