/**
 * @author Jörn Kreutel
 */
import {mwf} from "../Main.js";
import {entities} from "../Main.js";

export default class ListviewViewController extends mwf.ViewController {

    // instance attributes set by mwf after instantiation
    args;
    root;

    // custom instance attributes for this controller
    items;
    addNewMediaItemElement;

    constructor() {
        super();

        this.addNewMediaItemElement = null;
    }

    /*
     * for any view: initialise the view
     */
    async oncreate() {
        // TODO: do databinding, set listeners, initialise the view
        this.addNewMediaItemElement = this.root.querySelector("#addNewMediaItem");
        this.addNewMediaItemElement.onclick = (() => {
            // this.crudops.create(new entities.MediaItem("m", "https://picsum.photos/200/200")).then((created) => {
            //        this.addToListview(created);
            //    });
            this.createNewItem();
        });
        /*        this.crudops.readAll().then((items) => {
                    this.initialiseListview(this.items);
                });*/
        this.addListener(new mwf.EventMatcher("crud", "created", "MediaItem"), ((event) => {
            this.addToListview(event.data);
        }));
        this.addListener(new mwf.EventMatcher("crud", "updated", "MediaItem"), ((event) => {
            this.updateInListview(event.data._id, event.data);
        }));
        this.addListener(new mwf.EventMatcher("crud", "deleted", "MediaItem"), ((event) => {
            this.removeFromListview(event.data);
        }));

        entities.MediaItem.readAll().then((items) => {
            this.initialiseListview(items);
        });
        // call the superclass once creation is done
        super.oncreate();
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
        // implement how selection of the option menuitemview for itemobj shall be handled
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
        // this.crudops.delete(item._id).then(() => {
        //    this.removeFromListview(item._id);
        // });
        item.delete().then(() => {
        //     this.removeFromListview(item._id);
        });
    }

    editItem(item) {
        this.showDialog("mediaItemDialog", {
            item: item, actionBindings: {
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
        var newItem = new entities.MediaItem("m", "https://picsum.photos/100/100", "image/jpeg");
        this.showDialog("mediaItemDialog", {
            item: newItem, actionBindings: {
                submitForm: ((event) => {
                    event.original.preventDefault();
                    newItem.create().then(() => {
                    //     this.addToListview(newItem);
                    });
                    this.hideDialog()
                })
            }
        });
    }

}

