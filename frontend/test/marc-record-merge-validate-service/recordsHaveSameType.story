Candidate is valid if the records have the same type
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



Candidate is invalid if the records have different types
Preferred record:
LDR    00000_a____
001    28475
100    ‡aTest Author
245    ‡aSome content

Other record:
LDR    00000_b____
001    28475
100    ‡aTest Author
245    ‡aSome content

Expected to be valid: false
Expected failure message: Records are of different type (leader/6): a - b
