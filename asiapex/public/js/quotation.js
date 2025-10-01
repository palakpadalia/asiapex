frappe.ui.form.on('Quotation', {
    refresh: function (frm) {
        // Hide the top-right printer icon after it's rendered
        setTimeout(() => {
            frm.page.wrapper.find('button[data-original-title="Print"]').hide();
            frm.page.wrapper.find('button[title="Print"]').hide(); // just in case
        }, 100);

        // Add custom direct Print button
        if (!frm.is_new() && frm.doc.status !== 'Cancelled') {
            frm.add_custom_button(__('Print'), function () {
                const url = `/api/method/asiapex.py.quotation.print?name=${frm.doc.name}`;
                window.open(url);
            });
        }
    },

    validate: function (frm) {
        // Get total number of items
        let total_items = frm.doc.items ? frm.doc.items.length : 0;

        // Check each custom description
        if (frm.doc.custom_quotation_item_description) {
            frm.doc.custom_quotation_item_description.forEach(function (desc, idx) {
                let max_insert_before = total_items + 1;
                if (desc.insert_before && desc.insert_before > max_insert_before) {
                    frappe.throw(__('Row #{0}: "Insert Before" cannot be more than {1}', [idx + 1, max_insert_before]));
                    // Optionally, reset the value
                    desc.insert_before = max_insert_before;
                }
            });
        }
    }
});
