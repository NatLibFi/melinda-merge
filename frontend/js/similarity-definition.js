/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for merging MARC records
*
* Copyright (C) 2015-2017 University Of Helsinki (The National Library Of Finland)
*
* This file is part of marc-merge-ui
*
* marc-merge-ui program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* oai-pmh-server-backend-module-melinda is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

/*eslint-disable quotes */
const similarityDefinition = {
  "treshold": 50,
  "tests": [
    {
      "name": "LDR/007",
      "description": "Bibliographic level, should be automatic mismatch if does not match",
      "disabled": false,
      "false": -1150,
      "path": "$.leader",
      "options": {
        "extract": {
          "start": 7,
          "length": 1
        }
      }
    },
    {
      "name": "SID",
      "description": "NOT working? Match SID-fields that have equal b- and c-subfields",
      "disabled": true,
      "true": 50,
      "false": 0,
      "path": "$.fields[?(@.tag === 'SID')].subfields[?(@.code === 'b' || @.code === 'c')].value",
      "options": {
        "multimatch": {
          "percentage": 1,
          "respectHierarchy": -1
        }
      }
    },
    {
      "name": "035",
      "description": "Field 035",
      "disabled": true,
      "true": 50,
      "false": 0,
      "path": "$.fields[?(@.tag === '035')].subfields[?(@.code === 'a')].value"
    },
    {
      "name": "f024 8_ $a",
      "description": "Field 024 8_ can have BTJ Allfons ID (format A<number>). This can be thought to be disambiguous ID",
      "disabled": true,
      "true": 50,
      "false": -50,
      "path": "$.fields[?(@.tag === '024' && @.ind1 === '8' && @.ind2 === '')].subfields[?(@.code === 'a')].value",
      "options": {
        "skipMissing": true
      }
    },
    {
      "name": "f015",
      "description": "f015 National bibliography number",
      "disabled": true,
      "true": 20,
      "false": -10,
      "path": "$.fields[?(@.tag === '015' && @.ind1 === '' && @.ind2 === '')].subfields[?(@.code === 'a')].value"
    },
    {
      "name": "Title - main & sub",
      "description": "Field 245 $a, $b",
      "disabled": false,
      "true": 50,
      "false": -50,
      "path": "$.fields[?(@.tag === '245')].subfields[?(@.code === 'a' || @.code === 'b')].value",
      "options": {
        "truncate": 1000,
        "replace": {
          "pattern": "[.,/;:-= ?!]",
          "replacement": "",
          "flags": "gi"
        },
        "caseSensitive": false,
        "multimatch": {
          "leastTotal": true,
          "force": true
        }
      }
    },
    {
      "name": "Responsibility statement",
      "description": "Field 245 $c",
      "disabled": false,
      "true": 50,
      "false": -50,
      "path": "$.fields[?(@.tag === '245')].subfields[?(@.code === 'c')].value",
      "options": {
        "truncate": 100,
        "trim": {
          "chars": ",.:_\\-/= "
        },
        "caseSensitive": false,
        "skipMissing": true
      }
    },
    {
      "name": "Title for parts",
      "description": "Field 245 $n, $p",
      "disabled": false,
      "true": 20,
      "false": -150,
      "path": "$.fields[?(@.tag === '245')].subfields[?(@.code === 'n' || @.code === 'p')].value",
      "options": {
        "truncate": 10,
        "trim": {
          "chars": ",.:_\\-/= "
        }
      }
    },
    {
      "name": "Uniform title",
      "description": "Field 240",
      "disabled": false,
      "true": 20,
      "false": -20,
      "path": "$.fields[?(@.tag === '240')].subfields[?(@.code === '*')].value",
      "options": {
        "truncate": 10,
        "trim": {
          "chars": ",.:_\\-/= "
        },
        "skipMissing": true,
        "caseSensitive": false
      }
    },
    {
      "name": "f100a",
      "description": "f100a main entry",
      "disabled": false,
      "true": 20,
      "false": -10,
      "path": "$.fields[?(@.tag === '100')].subfields[?(@.code === 'a')].value",
      "options": {
        "trim": {
          "chars": ",.:_\\-/= "
        },
        "caseSensitive": false,
        "skipMissing": true
      }
    },
    {
      "name": "f306",
      "description": "f306 - duration",
      "disabled": true,
      "true": 20,
      "false": -10,
      "path": "$.fields[?(@.tag === '306')].subfields[?(@.code === 'a')].value"
    },
    {
      "name": "f041",
      "description": "Language code in f041 sf a",
      "disabled": true,
      "true": 10,
      "false": -20,
      "path": "$.fields[?(@.tag === '041')].subfields[?(@.code === 'a')].value"
    },
    {
      "name": "f773",
      "description": "f773 sf g ja sf q - location in the host",
      "disabled": true,
      "true": 50,
      "false": -50,
      "path": "$.fields[?(@.tag === '773')].subfields[?(@.code === 'g' || @.code === 'q')].value"
    }
  ]
};
/*eslint-enable quotes */

export default similarityDefinition;
