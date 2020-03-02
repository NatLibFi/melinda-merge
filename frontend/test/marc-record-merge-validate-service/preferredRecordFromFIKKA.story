Candidate is valid if the preferred record is from FENNI
Preferred record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
LOW    ‡aFIKKA

Other record:
LDR    00000_a____
001    28475
100    ‡aTest Author
245    ‡aSome content

Expected to be valid: true



Candidate is valid if neither are records are from FIKKA
Preferred record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content

Other record:
LDR    00000_a____
001    28475
100    ‡aTest Author
245    ‡aSome content

Expected to be valid: true



Candidate is invalid if the other record is from FIKKA
Preferred record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content

Other record:
LDR    00000_ab___
001    28474
100    ‡aTest Author
245    ‡aSome content
LOW    ‡aFIKKA

Expected to be valid: false
Expected failure message: The record with FIKKA LOW tag should usually be the preferred record
