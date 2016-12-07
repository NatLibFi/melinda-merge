It removes 035a subfields that start with (FI-MELINDA)
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

Merged record before postmerge:
LDR    00000_a____
001    28475
035    ‡a123
035    ‡a(FI-MELINDA)28475
035    ‡a(FI-MELINDA)28475‡bExtra-content-that-survives
100    ‡aTest Author
245    ‡aSome content

Expected record after postmerge:
LDR    00000_a____
001    28475
035    ‡a123
035    ‡bExtra-content-that-survives
100    ‡aTest Author
245    ‡aSome content
