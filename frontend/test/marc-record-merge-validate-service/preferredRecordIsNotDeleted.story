Candidate is valid if the preferred record is not deleted
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



Candidate is invalid if the preferred record is deleted
Preferred record:
LDR    00000da____
001    28474
100    ‡aTest Author
245    ‡aSome content

Other record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content

Expected to be valid: false
Expected failure message: Preferred record is deleted
