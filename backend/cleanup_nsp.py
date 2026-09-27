from utils.database import scholarships_collection

bad_names = [
    "Students Students Apply For One Time Registration (OTR) Apply For Scholarship Schemes on NSP Scholarship Eligibility Application Status Track Your Payment Aadhaar Seva Kendra Check Aadhaar Seeding Status NSP OTR APP Check UDID details How to seed Aadhaar with the Bank Account",

    "Apply For One Time Registration (OTR) Apply For Scholarship Schemes on NSP Scholarship Eligibility Application Status Track Your Payment Aadhaar Seva Kendra Check Aadhaar Seeding Status NSP OTR APP Check UDID details How to seed Aadhaar with the Bank Account",

    "Officers Officers Login Nodal Officers (Scheme-wise) Grievance Redressal Officers (GROs)",

    "Login Nodal Officers (Scheme-wise) Grievance Redressal Officers (GROs)",

    "Public Public Dashboard Find Institutes on NSP List of Applicants Processed for Scholarships Nodal Officers (Scheme-wise) Nodal Officers (District-wise ) NSP Helpdesk PFMS Helpdesk Grievance Registration CSC Login",

    "Dashboard Find Institutes on NSP List of Applicants Processed for Scholarships Nodal Officers (Scheme-wise) Nodal Officers (District-wise ) NSP Helpdesk PFMS Helpdesk Grievance Registration CSC Login",

    "Schemes Schemes On NSP",

    "Schemes",

    "Schemes On NSP Central Sector Schemes Centrally Sponsored Schemes State Schemes",

    "Scheme Open from : 01-06-2026",

    "Scheme Open from (for Renewal): 01-06-2026",

    "Scheme Open from : 16-09-2026",

    "Scheme Open from : 03-08-2026",

    "Scheme Open from : 25-07-2026",

    "Scheme Open from (for Renewal): 15-07-2026"
]

result = scholarships_collection.delete_many({
    "name": {
        "$in": bad_names
    }
})

print("Deleted:", result.deleted_count)
print("Remaining:", scholarships_collection.count_documents({}))