import React from 'react';
import '../../styles/components/marc-record-panel';

export class MarcRecordPanel extends React.Component {

  constructor() {
    super();
    this.val = `001 <control number>
003 <control number identifier>
005 19920331092212.7
007 ta
008 820305s1991####nyu###########001#0#eng##
020 ## a0845348116 :
       c$29.95 (£19.50 U.K.)
020 ## a0845348205 (pbk.)
040 ## a[organization code]
       c[organization code]
050 14 aPN1992.8.S4
       bT47 1991
082 04 a791.45/75/0973
       219
100 1# aTerrace, Vincent,
       d1948-
245 10 aFifty years of television :
       ba guide to series and pilots, 1937-1988 /
       cVincent Terrace.
246 1# a50 years of television
260 ## aNew York :
       bCornwall Books,
       cc1991.
300 ## a864 p. ;
       c24 cm.
500 ## aIncludes index.
650 #0 aTelevision pilot programs
       zUnited States
       vCatalogs.
650 #0 aTelevision serials
       zUnited States
       vCatalogs.`;
  }

  render() {
    return (
      <div className="card-panel darken-1 marc-record">
        <div>{this.val}</div>
      </div>
    );
  }
}
