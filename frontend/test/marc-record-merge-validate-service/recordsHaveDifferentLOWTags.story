Candidate is valid if records don't have same LOW tags
Preferred record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
LOW    ‡aTEST-A

Other record:
LDR    00000_a____
001    28475
100    ‡aTest Author
245    ‡aSome content
LOW    ‡aTEST-B

Expected to be valid: true



Candidate is invalid if records have same LOW tags
Preferred record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
LOW    ‡aTEST-A

Other record:
LDR    00000_a____
001    28475
100    ‡aTest Author
245    ‡aSome content
LOW    ‡aTEST-A

Expected to be valid: false
Expected failure message: Both records have have LOW tags TEST-A



Candidate is invalid if records have multiple same LOW tags
Preferred record:
Preferred record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
LOW    ‡aTEST-A
LOW    ‡aTEST-B

Other record:
LDR    00000_a____
001    28475
100    ‡aTest Author
245    ‡aSome content
LOW    ‡aTEST-A
LOW    ‡aTEST-B

Expected to be valid: false
Expected failure message: Both records have have LOW tags TEST-A, TEST-B
