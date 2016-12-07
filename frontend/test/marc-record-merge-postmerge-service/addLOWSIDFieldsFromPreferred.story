When preferred record has LOW but not SID, it adds LOW fields from preferred record and generates a new SID
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
SID    ‡cFCC28474‡btest-a



When preferred record has LOW and SID, it adds those from preferred record
Preferred record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
LOW    ‡aTEST-A
SID    ‡btest-a‡c123

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
SID    ‡btest-a‡c123

Expected record after postmerge:
LDR    00000_a____
001    28475
041    ‡aFI
100    ‡aTest Author
245    ‡aSome content
LOW    ‡aTEST-A
SID    ‡btest-a‡c123
