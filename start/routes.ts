/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import PassionController from "#controllers/passions_controller";


router.post("/register", [PassionController, 'handleRequest'] as any);
router.post("/add_phrase", [PassionController, 'addPhraseAndTrain'] as any);
