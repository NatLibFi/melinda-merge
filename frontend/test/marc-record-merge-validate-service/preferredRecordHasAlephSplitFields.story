Candidate is valid if the preferred record does not contain aleph split fields
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



Candidate is invalid if the preferred record contains aleph split fields
Preferred record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
500    ‡aSome long field
500    ‡a^^that spans on multiple fields
500    ‡a^^this is the aleph-ils way

Other record:
LDR    00000da____
001    28474
100    ‡aTest Author
245    ‡aSome content

Expected to be valid: false
Expected failure message: The long field 500 in preferred record has been split to multiple fields. Check that it looks ok.
