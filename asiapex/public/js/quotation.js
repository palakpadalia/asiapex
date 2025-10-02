// ---------------- Constants ----------------
// Child table name in the Quotation form
const CHILD_TABLE = 'custom_quotation_item_description';
// Child doctype associated with the child table
const CHILD_DOCTYPE = 'Item Group Description';
// Name of the Select field in the child table used for choosing the insert position
const SELECT_FIELD = 'item_insert_before';
// Name of the numeric field in the child table that stores the actual row number
const NUMERIC_FIELD = 'insert_before';

// ---------------- Helper Functions ----------------

/**
 * Build options string for the Select field in the child table.
 * Each option shows the row number and corresponding item code from the parent Quotation items.
 * Example: "1. ITEM001\n2. ITEM002\n..."
 */
function build_options(frm) {
    const items = frm.doc.items || [];
    return items.map((d, i) => `${i + 1}. ${d.item_code || ''}`).join('\n') || '\n';
}

/**
 * Refresh the child table's Select field options and ensure numeric field values are valid.
 * Does not overwrite user selection in the Select field.
 */
function refresh_child_select(frm) {
    const grid_wrapper = frm.fields_dict[CHILD_TABLE];
    if (!grid_wrapper) return;

    const grid = grid_wrapper.grid;
    const options = build_options(frm);

    // Update the Select field options dynamically in the grid
    try {
        grid.update_docfield_property(SELECT_FIELD, 'options', options);
    } catch (e) { console.warn(e); }

    // Ensure the numeric field is within valid range (1 to total items + 1)
    (frm.doc[CHILD_TABLE] || []).forEach(row => {
        let n = parseInt(row[NUMERIC_FIELD]);
        if (!n || n < 1) n = 1;
        if (n > (frm.doc.items || []).length + 1) n = (frm.doc.items || []).length + 1;
        row[NUMERIC_FIELD] = n;
    });

    // Refresh the grid to reflect changes
    grid.refresh();
    frm.refresh_field(CHILD_TABLE);
}

// ---------------- Parent Doctype Hooks ----------------
frappe.ui.form.on('Quotation', {

    /**
     * Triggered on form refresh
     */
    refresh(frm) {

        // Hide the default Print button after a short delay
        // setTimeout(() => {
        //     if (frm.page && frm.page.wrapper) {
        //         frm.page.wrapper.find('button[data-original-title="Print"]').hide();
        //         frm.page.wrapper.find('button[title="Print"]').hide();
        //     }
        // }, 100);

        // Add a custom Print button if the document is not new or cancelled
        if (!frm.is_new() && frm.doc.status !== 'Cancelled') {
            frm.add_custom_button(__('Print'), function () {
                window.open(`/api/method/asiapex.py.quotation.print?name=${frm.doc.name}`);
            });
        }

        // Attach event to refresh child table Select field whenever the grid renders
        const grid_wrapper = frm.fields_dict[CHILD_TABLE];
        if (grid_wrapper && grid_wrapper.grid) {
            grid_wrapper.grid.wrapper.on('render_complete', () => refresh_child_select(frm));
        }
    },

    /**
     * Triggered before saving the form to validate child table numeric values
     */
    validate(frm) {
        const total = frm.doc.items ? frm.doc.items.length : 0;
        (frm.doc[CHILD_TABLE] || []).forEach((row, idx) => {
            if (row[NUMERIC_FIELD] > total + 1) {
                frappe.throw(__('Row #{0}: "Insert Before" cannot be more than {1}', [idx + 1, total + 1]));
                row[NUMERIC_FIELD] = total + 1;
            }
        });
    },

    // Trigger refresh when items are added, removed, or changed
    items_add(frm) { setTimeout(() => refresh_child_select(frm), 50); },
    items_remove(frm) { setTimeout(() => refresh_child_select(frm), 50); },
    items_change(frm) { setTimeout(() => refresh_child_select(frm), 50); },
    custom_quotation_item_description_add(frm) { setTimeout(() => refresh_child_select(frm), 50); }
});

// ---------------- Child Table Hooks ----------------
frappe.ui.form.on(CHILD_DOCTYPE, {

    /**
     * Triggered when the Select field changes in the child table
     * Updates the corresponding numeric field based on selected row number
     */
    [SELECT_FIELD](frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        if (!row) return;

        const val = row[SELECT_FIELD] || '';
        const m = val.match(/^\s*(\d+)/);
        row[NUMERIC_FIELD] = m ? parseInt(m[1], 10) : null;

        frm.refresh_field(CHILD_TABLE);
    },

    /**
     * Triggered when a new row is added in the child table
     * Sets default numeric value and clears the Select field for user input
     */
    custom_quotation_item_description_add(frm, cdt, cdn) {
        const row = locals[cdt][cdn];
        if (!row) return;

        const total_items = (frm.doc.items || []).length;
        row[NUMERIC_FIELD] = total_items + 1;
        row[SELECT_FIELD] = ''; // Leave blank for user to choose

        refresh_child_select(frm);
    }
});
