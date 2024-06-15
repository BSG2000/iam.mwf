/**
 * @author Jörn Kreutel
 *
 * this skript defines the data types used by the application and the model operations for handling instances of the latter
 */


import {mwfUtils} from "../Main.js";
import {EntityManager} from "../Main.js";

/*************
 * example entity
 *************/

export class MyEntity extends EntityManager.Entity {

    // TODO-REPEATED: declare entity instance attributes

    constructor() {
        super();
    }

}

// MediaItem entity class declarations
export class MediaItem extends EntityManager.Entity {

    // Declare entity instance attributes for MediaItem
    title;
    src;
    contentType;
    added;
    description;
    srcType;

    constructor(title, src, contentType, description) {
        super();
        this.title = title;
        this.description = description;
        this.added = Date.now();
        this.src = src;
        this.srcType  = null;
        this.contentType = contentType;
    }

    get addedDateString() {
        return (new Date(this.added)).toLocaleDateString();
    }

    get mediaType() {
        if (this.contentType) {
            var index = this.contentType.indexOf("/");
            if (index > -1) {
                return this.contentType.substring(0, index);
            }
            else {
                return "UNKNOWN"
            }
        }
        else {
            return "UNKNOWN"
        }
    }
}
