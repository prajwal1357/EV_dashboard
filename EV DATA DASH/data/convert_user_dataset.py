import os
import zipfile
import xml.etree.ElementTree as ET
import csv

def parse_xlsx(xlsx_path):
    print(f"Reading Excel file: {xlsx_path}")
    with zipfile.ZipFile(xlsx_path, 'r') as z:
        # Load shared strings if exists
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            # namespace
            ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            for si in tree.findall('.//ns:t', ns):
                shared_strings.append(si.text or "")

        # Read sheet1.xml
        sheet_xml = z.read('xl/worksheets/sheet1.xml')
        tree = ET.fromstring(sheet_xml)
        ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        
        rows = []
        for row in tree.findall('.//ns:row', ns):
            row_vals = []
            for c in row.findall('./ns:c', ns):
                val_type = c.attrib.get('t')
                v_elem = c.find('ns:v', ns)
                val = v_elem.text if v_elem is not None else ""
                
                if val_type == 's' and val != "":
                    idx = int(val)
                    if idx < len(shared_strings):
                        val = shared_strings[idx]
                row_vals.append(val)
            if row_vals:
                rows.append(row_vals)
                
    return rows

def convert_and_inspect():
    user_file = r"C:\Users\Ganesh\Downloads\EV_Fleet_Data2 (1).csv.xlsx"
    rows = parse_xlsx(user_file)
    print(f"Total Rows Found: {len(rows)}")
    if rows:
        print("Header Columns Found:")
        print(rows[0])
        print("\nFirst 3 Sample Rows:")
        for r in rows[1:4]:
            print(r)
            
        # Write to project dataset
        out_csv = os.path.join('data', 'ev_fleet_charging_data.csv')
        with open(out_csv, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerows(rows)
        print(f"\nSuccessfully copied user dataset to {out_csv}")

if __name__ == '__main__':
    convert_and_inspect()
