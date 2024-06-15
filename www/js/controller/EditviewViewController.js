/**
 * @author Thomas Krohnfuß
 */
import { mwf, MyApplication } from "../Main.js";
import { entities } from "../Main.js";

export default class EditviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;

    // custom instance attributes for this controller
    viewProxy;
    previewImage;

    constructor() {
        super();

        console.log("EditviewViewController()");
    }

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // initialize the view with data and event listeners
        var mediaItem = this.args.item;
        this.viewProxy = this.bindElement("mediaEditviewTemplate", { item: mediaItem }, this.root).viewProxy;

        // Vorschaubild-Element abrufen
        this.previewImage = this.root.querySelector("#previewImage");

        // Event-Listener für das src Eingabefeld hinzufügen
        const srcInput = this.root.querySelector("input[name='src']");
        srcInput.addEventListener("input", (event) => {
            this.previewImage.src = event.target.value;
        });

        this.viewProxy.bindAction("deleteItem", (() => {
            this.showDeleteConfirmationDialog(mediaItem);
        }));

        this.viewProxy.bindAction("saveItem", (() => {
            this.saveItem(mediaItem);
        }));

        // Call super.oncreate() to complete setup
        super.oncreate();
    }

    showDeleteConfirmationDialog(mediaItem) {
        this.showDialog("deleteConfirmationDialog", {
            item: mediaItem,
            actionBindings: {
                cancelDelete: (() => {
                    this.hideDialog();
                }),
                confirmDelete: (() => {
                    mediaItem.delete().then(() => {
                        this.notifyListeners(new mwf.Event("crud", "deleted", "MediaItem", mediaItem._id));
                        this.previousView({ deletedItem: mediaItem });
                    });
                    this.hideDialog();
                })
            }
        });
    }

    saveItem(mediaItem) {
        console.log("saveItem method called");
        // Werte aus den Formularelementen abrufen
        const form = this.root.querySelector("#mediaItemForm");
        const formData = new FormData(form);
        mediaItem.src = formData.get("src");
        mediaItem.title = formData.get("title");
        mediaItem.description = formData.get("description");

        if (!mediaItem.created) {
            mediaItem.create().then(() => {
                this.notifyListeners(new mwf.Event("crud", "created", "MediaItem", mediaItem));
                this.previousView({ createdItem: mediaItem });
            });
        } else {
            mediaItem.update().then(() => {
                this.notifyListeners(new mwf.Event("crud", "updated", "MediaItem", mediaItem));
                this.previousView({ updatedItem: mediaItem });
            });
        }
    }

    /*
     * for views that initiate transitions to other views
     * NOTE: return false if the view shall not be returned to, e.g. because we immediately want to display its previous view. Otherwise, do not return anything.
     */
    async onReturnFromNextView(nextviewid, returnValue, returnStatus) {
        // TODO: check from which view, and possibly with which status, we are returning, and handle returnValue accordingly
    }

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */
    bindListItemView(listviewid, itemview, itemobj) {
        // TODO: implement how attributes of itemobj shall be displayed in itemview
    }

    /*
     * for views with listviews: react to the selection of a listitem
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemSelected(itemobj, listviewid) {
        // TODO: implement how selection of itemobj shall be handled
    }

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(menuitemview, itemobj, listview) {
        // TODO: implement how selection of the option menuitemview for itemobj shall be handled
    }

    /*
     * for views with dialogs
     * TODO: delete if no dialogs are used or if generic controller for dialogs is employed
     */
    bindDialog(dialogid, dialogview, dialogdataobj) {
        // call the supertype function
        super.bindDialog(dialogid, dialogview, dialogdataobj);

        // TODO: implement action bindings for dialog, accessing dialog.root
    }
}
