from PyPDF2 import PdfMerger
import frappe
from frappe.utils.pdf import get_pdf


@frappe.whitelist()
def print(name):
    import io
    from PyPDF2 import PdfMerger

    if not name:
        frappe.throw("Missing Quotation name.")

    doctype = "Quotation"
    first_page_print_format = "Quotation First Page"
    rest_page_print_format = "Quotation"
    last_page_print_format = "Quotation Last Page"   # ✅ new
    letterhead = "Default"

    # Fetch Quotation doc
    doc = frappe.get_doc(doctype, name)

    merged_pdf = PdfMerger()

    # --- First page PDF ---
    html_first = frappe.get_print(
        doctype,
        name,
        print_format=first_page_print_format,
        as_pdf=False,
        letterhead=letterhead,
    )
    pdf_first = get_pdf(html_first)
    merged_pdf.append(io.BytesIO(pdf_first))

    # --- Rest page PDF ---
    html_rest = frappe.get_print(
        doctype,
        name,
        print_format=rest_page_print_format,
        as_pdf=False,
        letterhead=letterhead,
    )
    pdf_rest = get_pdf(html_rest)
    merged_pdf.append(io.BytesIO(pdf_rest))

    # --- Last page PDF (new) ---
    html_last = frappe.get_print(
        doctype,
        name,
        print_format=last_page_print_format,
        as_pdf=False,
        letterhead=letterhead,
    )
    pdf_last = get_pdf(html_last)
    merged_pdf.append(io.BytesIO(pdf_last))

    # --- Output ---
    output = io.BytesIO()
    merged_pdf.write(output)
    merged_pdf.close()

    frappe.local.response.filename = f"{name}_Half_A4.pdf"
    frappe.local.response.filecontent = output.getvalue()
    frappe.local.response.type = "pdf"
