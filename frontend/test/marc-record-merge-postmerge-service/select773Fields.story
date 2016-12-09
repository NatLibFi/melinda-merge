It selects 773 fields properly, when preferred host id is 00001 and other host id is 00002
Preferred record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
773    ‡w(FI-MELINDA)00001‡aLink to host in preferred
773    ‡w(FI-MELINDA)00003‡aLink to something else in preferred
773    ‡w(FI-MELINDA)00005‡aLink to something else in both

Other record:
LDR    00000_a____
001    28475
100    ‡aTest Author
245    ‡aSome content
773    ‡w(FI-MELINDA)00002‡aLink to host in other
773    ‡w(FI-MELINDA)00004‡aLink to something else in other
773    ‡w(FI-MELINDA)00005‡aLink to something else in both

Merged record before postmerge:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
773    ‡w(FI-MELINDA)00001‡aLink to host in preferred
773    ‡w(FI-MELINDA)00003‡aLink to something else in preferred
773    ‡w(FI-MELINDA)00005‡aLink to something else in both
773    ‡w(FI-MELINDA)00002‡aLink to host in other
773    ‡w(FI-MELINDA)00004‡aLink to something else in other

Expected record after postmerge:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
773    ‡w(FI-MELINDA)00003‡aLink to something else in preferred
773    ‡w(FI-MELINDA)00005‡aLink to something else in both
773    ‡w(FI-MELINDA)00004‡aLink to something else in other
773    ‡w(FI-MELINDA)[future-host-id]‡aLink to host in preferred



It selects 773 link field from other if there is none in preferred
Preferred record:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
773    ‡w(FI-MELINDA)00003‡aLink to something else in preferred
773    ‡w(FI-MELINDA)00005‡aLink to something else in both

Other record:
LDR    00000_a____
001    28475
100    ‡aTest Author
245    ‡aSome content
773    ‡w(FI-MELINDA)00002‡aLink to host in other
773    ‡w(FI-MELINDA)00004‡aLink to something else in other
773    ‡w(FI-MELINDA)00005‡aLink to something else in both

Merged record before postmerge:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
773    ‡w(FI-MELINDA)00003‡aLink to something else in preferred
773    ‡w(FI-MELINDA)00005‡aLink to something else in both
773    ‡w(FI-MELINDA)00002‡aLink to host in other
773    ‡w(FI-MELINDA)00004‡aLink to something else in other

Expected record after postmerge:
LDR    00000_a____
001    28474
100    ‡aTest Author
245    ‡aSome content
773    ‡w(FI-MELINDA)00003‡aLink to something else in preferred
773    ‡w(FI-MELINDA)00005‡aLink to something else in both
773    ‡w(FI-MELINDA)00004‡aLink to something else in other
773    ‡w(FI-MELINDA)[future-host-id]‡aLink to host in other