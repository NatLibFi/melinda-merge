When other record has LOW but not SID, it adds LOW fields from other record and generates a new SID
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

Merged record before postmerge:
LDR    00000_a____
001    28475
041    ‡aFI
100    ‡aTest Author
245    ‡aSome content
LOW    ‡aTEST-A

Expected record after postmerge:
LDR    00000_a____
001    28475
041    ‡aFI
100    ‡aTest Author
245    ‡aSome content
LOW    ‡aTEST-A
LOW    ‡aTEST-B
SID    ‡cFCC28475‡btest-b



When other record has LOW and SID, it adds those from other record
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
SID    ‡btest-b‡c123

Merged record before postmerge:
LDR    00000_a____
001    28475
041    ‡aFI
100    ‡aTest Author
245    ‡aSome content
LOW    ‡aTEST-A

Expected record after postmerge:
LDR    00000_a____
001    28475
041    ‡aFI
100    ‡aTest Author
245    ‡aSome content
LOW    ‡aTEST-A
LOW    ‡aTEST-B
SID    ‡btest-b‡c123
