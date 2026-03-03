# Digital Banking System

Full stack digital banking system with a simulation of core banking processes such as account management, funds transfer, loans, fixed deposits, card management, investor management, and admin management.

This project is a simulation of how a modern banking system works with different user roles and a structured workflow.

Detailed system design and structure:

Please refer to the following:

* [SCHEMA](documentation/SCHEMA.md) : `documentation/SCHEMA.md`
* [WIREFRAME](documentation/WIREFRAME.md) : `documentation/WIREFRAME.md`

---

## Overview

This system has multiple user roles that are supported. These roles are as follows:

* Customer
* Loan Officer
* Investor
* Admin

These roles have their own dashboards and functionalities to simulate real-world banking scenarios.

The system supports end-to-end financial processes from account to investment to loans.

---

## Core Features

### User Management

* User registration
* Role-based access control
* Login with credential verification
* Profile management
* Update password
* Activate/deactivate account (Admin)

---

### Customer Features

#### Account Management

* Create savings/current accounts
* Generate account numbers
* View all linked accounts
* Add joint account holders
* Close accounts (with validation)
* Freeze detection support

#### Fund Transfers

* Transfer funds between accounts
* Validation:

  * Balance in account
  * Account status
  * Destination account status
* Atomic transaction processing
* Automatic transaction logging
* Failure handling

#### Transaction History

* View transaction history
* View sent/received transaction history
* View transaction details
* Timestamp sorting

#### Card Management

* Apply for cards
* Automatic card number generation
* CVV generation and hashing
* Expiry date support
* Block cards
* View all active cards

#### Fixed Deposits

* Create fixed deposits using linked accounts
* Automatic interest rate generation
* Maturity date calculation
* Principal deduction on creation
* View all active fixed deposits
* Close fixed deposit support
* Track status (active/closed)

#### Loan Management

* Apply for loan
* Track loan status (pending/approved/closed/not verified)
* Loan repayment support
* Automatic status update on repayment
* Restrict if KYC not verified

#### Offers

* View all active offers
* Offers based on eligibility criteria
* Cashback and discount support
* Apply for offers during:
  * Loan interest calculation
  * Transactions
  * Cards

---

### Loan Officer Features

* View all pending loan applications
* Approve loans
* Reject loans
* Automatic loan disbursal on approval
* Credit the loan amount to the customer’s account
* KYC verification workflow
* View customer profiles

---

### Investor Features

* Dedicated investor dashboard
* Investment balance tracking
* View loan investment pool
* Invest in loan pools
* Track returns
* View investment transaction history
* Risk profile categorization

---

### Admin Features

* Manage users (activate/deactivate)
* Freeze customer accounts
* Create, update, and expire offers
* View system-level reports:

  * Total accounts
  * Total loans
  * Total transactions
* Administrative control over operational flow

---

## Security-Oriented Features

* Password hashing before storage
* CVV hashing for card security
* Unique email enforcement
* Unique account number enforcement
* Role-based dashboard routing
* Status-based access control
* Atomic financial operations
* Validation before financial state changes

---

## Financial Integrity Controls

The system ensures:

* No transfers without sufficient balance
* No loan disbursement without approval
* No account closure with active obligations
* No duplicate users
* No duplicate accounts
* Transaction logging for every financial event

---

## System Behavior Simulation

The platform simulates real banking logic such as:

* KYC verification dependency
* Loan approval workflow
* Principal disbursement tracking
* Joint account ownership
* Offer eligibility validation
* Investor participation in loan pools
* Status transitions for financial instruments

---

## Intended Use

This project is designed for:

* Academic learning
* System design understanding
* Backend architecture practice
* Financial workflow simulation
* Role-based system modeling

---

## Future Enhancements (Planned)

* Real-time transaction notifications
* Audit logging system
* Interest accrual automation
* Scheduled maturity processing
* Credit score integration
* Fraud detection simulation
* Advanced analytics dashboard