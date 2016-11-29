Candidate is valid if the other record is not suppressed
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



Candidate is invalid if the other record is suppressed
Preferred record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content

Other record:
LDR    00000da____
001    28474
100    ‡aTest Author
245    ‡aSome content
STA    ‡aSUPPRESSED

Expected to be valid: false
Expected failure message: Other record is suppressed
