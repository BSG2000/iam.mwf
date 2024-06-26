import { mwf, MyApplication } from "../Main.js";
import { entities } from "../Main.js";

export default class ListviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;

    // custom instance attributes for this controller
    items;
    addNewMediaItemElement;
    switchCRUDButton;
    crudModeIndicator;
    lastUpdatedItemId;
    addedItemIds; // Set to track added items

    constructor() {
        super();
        this.addNewMediaItemElement = null;
        this.switchCRUDButton = null;
        this.crudModeIndicator = null;
        this.lastUpdatedItemId = null; // To keep track of the last updated item
        this.addedItemIds = new Set(); // Initialize the Set to track added items
    }

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // do databinding, set listeners, initialise the view
        this.addNewMediaItemElement = this.root.querySelector("#addNewMediaItem");
        this.switchCRUDButton = this.root.querySelector("#switchCRUDButton");
        this.crudModeIndicator = this.root.querySelector("#crudModeIndicator");

        // Setzen des initialen CRUD-Modus Indikators
        this.updateCrudModeIndicator();

        // Event-Listener für die Schaltfläche "Neues Medium hinzufügen"
        this.addNewMediaItemElement.onclick = (() => {
            this.createNewItem();
        });

        // Event-Listener für die Schaltfläche "CRUD-Modus wechseln"
        this.switchCRUDButton.onclick = (() => {
            this.switchCRUDMode();
        });

        // Event-Listener für CRUD-Operationen
        this.addListener(new mwf.EventMatcher("crud", "created", "MediaItem"), ((event) => {
            this.addItemToListview(event.data);
            this.lastUpdatedItemId = event.data._id; // Keep track of the new item
        }));
        this.addListener(new mwf.EventMatcher("crud", "updated", "MediaItem"), ((event) => {
            this.updateInListview(event.data._id, event.data);
            this.lastUpdatedItemId = event.data._id; // Keep track of the updated item
        }));
        this.addListener(new mwf.EventMatcher("crud", "deleted", "MediaItem"), ((event) => {
            this.removeFromListview(event.data);
        }));

        // Initialisieren der Listenansicht mit Elementen aus dem aktuellen CRUD-Modus
        this.loadMediaItems();

        // Superklasse aufrufen, sobald die Erstellung abgeschlossen ist
        super.oncreate();
    }

    // Funktion zum Aktualisieren des CRUD-Modus Indikators
    updateCrudModeIndicator() {
        this.crudModeIndicator.textContent = MyApplication.currentCRUDScope;
    }

    // Funktion zum Umschalten des CRUD-Modus
    switchCRUDMode() {
        const newMode = (MyApplication.currentCRUDScope === MyApplication.CRUDOPS.LOCAL) ? MyApplication.CRUDOPS.REMOTE : MyApplication.CRUDOPS.LOCAL;
        MyApplication.switchCRUD(newMode);
        this.updateCrudModeIndicator();
        this.loadMediaItems();
    }

    // Funktion zum Laden der Media Items basierend auf dem aktuellen CRUD-Modus
    loadMediaItems() {
        entities.MediaItem.readAll().then((items) => {
            this.initialiseListview(items);
        });
    }

    /*
     * for views with listviews: bind a list item to an item view
     * TODO: delete if no listview is used or if databinding uses ractive templates
     */
    /*
    bindListItemView(listviewid, itemview, itemobj) {
        // implement how attributes of itemobj shall be displayed in itemview
        console.log("bindListItemView() called for item:", itemobj);

        itemview.root.getElementsByTagName("img")[0].src = itemobj.src;
        itemview.root.getElementsByTagName("h2")[0].textContent = itemobj.title+itemobj._id;
        itemview.root.getElementsByTagName("h3")[0].textContent = itemobj.added;
    }
    */

    /*
     * for views with listviews: react to the selection of a listitem menu option
     * TODO: delete if no listview is used or if item selection is specified by targetview/targetaction
     */
    onListItemMenuItemSelected(menuitemview, itemobj, listview) {
        super.onListItemMenuItemSelected(menuitemview, itemobj, listview);
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

    deleteItem(item) {
        this.showDialog("deleteConfirmationDialog", {
            item: item,
            actionBindings: {
                cancelDelete: (() => {
                    this.hideDialog();
                }),
                confirmDelete: (() => {
                    item.delete().then(() => {
                        this.removeFromListview(item._id);
                    });
                    this.hideDialog();
                })
            }
        });
    }

    editItem(item) {
        this.showDialog("mediaItemDialog", {
            item: item,
            actionBindings: {
                submitForm: ((event) => {
                    event.original.preventDefault();
                    item.update().then(() => {
                        //     this.updateInListview(item._id, item);
                    });
                    this.hideDialog();
                }),/* !!! */
                deleteItem: ((event) => {
                    this.deleteItem(item);
                    this.hideDialog();
                })
            }
        });
    }

    createNewItem() {
        var newItem = new entities.MediaItem("m", "https://picsum.photos/100/100", "image/jpeg", "No Description available");
        this.nextView("mediaEditview", {item: newItem});
    }

    copyItem(item) {
        var copiedItem = new entities.MediaItem(item.title + " (Kopie)", item.src, item.contentType, item.description);
        copiedItem.create().then((createdItem) => {
            this.addItemToListview(createdItem);
            this.lastUpdatedItemId = createdItem._id; // Keep track of the copied item
        });
    }

    // Override onresume to scroll to the updated/created item
    async onresume() {
        super.onresume();
        if (this.lastUpdatedItemId) {
            // Use a timeout to ensure the view has completed rendering
            setTimeout(() => {
                const itemView = this.getItemviewFromListview(this.lastUpdatedItemId);
                if (itemView) {
                    itemView.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 100);
            this.lastUpdatedItemId = null; // Reset the tracker
        }
    }

    // Method to add an item to the list view with duplication check
    addItemToListview(item) {
        // Check if the item has already been added
        if (this.addedItemIds.has(item._id)) {
            console.log("addToListview(): Item already added: " + item._id);
            return;
        }

        // Call the framework method to add the item to the listview
        this.addToListview(item);
        this.addedItemIds.add(item._id); // Track the added item
    }
}
