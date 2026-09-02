function getAccessToken(hostName, authConfig) {
    const url = `https://${hostName}/api/oauth2/token`;

    const headers = {
        'Accept': 'application/json'
    };

    const body = new URLSearchParams({
        grant_type: 'password',
        client_id: authConfig.clientID,
        client_secret: authConfig.clientSecret,
        scope: 'offline',
        username: authConfig.username,
        password: authConfig.password
    });

    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: body
    })
        .then(async response => {
            if (!response.ok) {
                throw new Error(`Token request failed: ${response.status} ${await response.text()}`);
            }
            return response.json();
        })
        .then(data => data.access_token)
        .catch(error => {
            console.error('Error fetching access token:', error);
            throw error;
        });
}

function getObjectData(hostName, accessToken, object) {
    const url = `https://${hostName}/api/v1/search`;
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    const body = JSON.stringify({
        'search': [{
            "type": "in",
            "bool": "must",
            "fields": ["_system_object_id"],
            "in": [object.objectID]
        }],
        'objecttype': object.objectType,
        'format': 'long'
    });

    return fetch(url, {
        method: 'POST',
        headers: headers,
        body: body
    })
        .then(async response => {
            if (!response.ok) {
                throw new Error(`Object data request failed: ${response.status} ${await response.text()}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error fetching object data:', error);
            throw error;
        });
}

async function fetchObjectData(hostName, authConfig, object) {
    return getAccessToken(hostName, authConfig)
        .then(accessToken => getObjectData(hostName, accessToken, object))
        .catch(error => {
            console.error('Error in fetchObjectData:', error);
            throw error;
        });
}

function getCurrentStatusURI(object) {
    return object["_nested:item__event"]?.find(
        (event) =>
            event.lk_eventtyp?.conceptURI ===
            "http://uri.gbv.de/terminology/object_related_event/978eb685-12d0-45d2-ac64-77bc64b7de0b" &&
            event.lk_status !== undefined &&
            event.lk_veroeffentlichen?.ja_nein_objekttyp?._id === 1,
    )?.lk_status?.conceptURI;
}


function getObjectCategoryURI(object) {
    return object["_nested:item__objektkategorie"]?.[0]?.lk_objektkategorie
        ?.conceptURI;
}

function getAreaTypeURI(object) {
    return object.lk_dante_art?.conceptURI;
}

function getLayerAndStyle(values) {
    let layerName;
    let style;
    let styleOrder;

    switch (values.objectType) {
        case "item":
            switch (values.poolName) {
                case "Archäologie":
                    switch (values.currentStatusURI) {
                        case "http://uri.gbv.de/terminology/nld_designation_status/b753e003-c2f7-4b85-86a0-304180939e88":
                            layerName = "baudenkmal_einzel";
                            style = "arch_baudenkmal_teil_gruppe";
                            styleOrder = 8;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/e5993e74-7f1f-4183-933e-1a1303e1f9cf":
                            layerName = "baudenkmal_einzel";
                            style = "arch_baudenkmal_teil_baudenkmal";
                            styleOrder = 9;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/54d1f9d4-d055-4fcb-8fe9-bd31dd520e94":
                            layerName = "baudenkmal_gruppe";
                            style = "arch_baudenkmal_gruppe";
                            styleOrder = 1;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/ae4e4c47-5d6a-43c1-b048-bf02c892a249":
                            layerName = "baudenkmal_einzel";
                            style = "arch_baudenkmal_einzel";
                            styleOrder = 1;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/ce737365-5223-45f0-8e71-027feb8827b1":
                            layerName = "denkmal_in_ausweisung_prueffall";
                            style = "arch_denkmal_in_ausweisung_einzel";
                            styleOrder = 2;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/4cff406c-35ff-4f73-bcfa-2f320a2394d4":
                            layerName = "denkmal_in_ausweisung_prueffall";
                            style = "arch_denkmal_in_ausweisung_gruppe";
                            styleOrder = 4;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/ddd8b550-b115-4afc-80d6-04351fd682df":
                            layerName = "denkmal_in_ausweisung_prueffall";
                            style = "arch_denkmal_in_ausweisung_teil_baudenkmal";
                            styleOrder = 5;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/2c8ceac4-62e9-4b38-8487-c4cceecb389d":
                            layerName = "denkmal_in_ausweisung_prueffall";
                            style = "arch_denkmal_in_ausweisung_teil_gruppe";
                            styleOrder = 3;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/89db8787-f763-4791-af9f-93dd1f3ebd08":
                            layerName = "nichtdenkmal_ehem_denkmal";
                            style = "arch_ehem_denkmal";
                            styleOrder = 1;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/048295c7-3191-4b7c-9771-f3c45637c03b":
                            layerName = "denkmal_in_ausweisung_prueffall";
                            style = "arch_prueffall";
                            styleOrder = 1;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/29945c9d-96cc-4b69-a057-f31e806abc91":
                        case "http://uri.gbv.de/terminology/nld_designation_status/69d66137-70bb-4d14-9207-24873ee8a8ce":
                            layerName = "bodendenkmal_fundstelle";
                            style = "bodendenkmal";
                            styleOrder = 2;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/7eb175f5-32cd-4849-a2dd-1d46e039fdc4":
                            layerName = "bodendenkmal_fundstelle";
                            style = "fundstelle";
                            styleOrder = 1;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/cbf30ab5-8a9d-4168-a775-0c32dc9751fc":
                            layerName = "infoobjekt";
                            style = "falsifizierte_fundstelle";
                            styleOrder = 2;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/9eaf7321-0cfa-45e1-a53f-3a4fd976100b":
                            layerName = "infoobjekt";
                            style = "infoobjekt";
                            styleOrder = 2;
                            break;
                    }
                    break;
                case "Baudenkmalpflege":
                    switch (values.objectCategoryURI) {
                        case "http://uri.gbv.de/terminology/nld_object_category/f36ecc28-0bed-4c2e-aedb-7c596990ce82":
                            switch (values.currentStatusURI) {
                                case "http://uri.gbv.de/terminology/nld_designation_status/ae4e4c47-5d6a-43c1-b048-bf02c892a249":
                                    layerName = "baudenkmal_einzel";
                                    style = "buk_baudenkmal_einzel_ba";
                                    styleOrder = 2;
                                    break;
                                case "http://uri.gbv.de/terminology/nld_designation_status/e5993e74-7f1f-4183-933e-1a1303e1f9cf":
                                    layerName = "baudenkmal_einzel";
                                    style = "buk_baudenkmal_teil_baudenkmal_ba";
                                    styleOrder = 16;
                                    break;
                                case "http://uri.gbv.de/terminology/nld_designation_status/b753e003-c2f7-4b85-86a0-304180939e88":
                                    layerName = "baudenkmal_einzel";
                                    style = "buk_baudenkmal_teil_gruppe_ba";
                                    styleOrder = 10;
                                    break;
                            }
                            break;
                        case "http://uri.gbv.de/terminology/nld_object_category/032d10eb-e300-40cc-85c7-16c3e845d067":
                            switch (values.currentStatusURI) {
                                case "http://uri.gbv.de/terminology/nld_designation_status/ae4e4c47-5d6a-43c1-b048-bf02c892a249":
                                    layerName = "baudenkmal_einzel";
                                    style = "buk_baudenkmal_einzel_tba";
                                    styleOrder = 6;
                                    break;
                                case "http://uri.gbv.de/terminology/nld_designation_status/e5993e74-7f1f-4183-933e-1a1303e1f9cf":
                                    layerName = "baudenkmal_einzel";
                                    style = "buk_baudenkmal_teil_baudenkmal_tba";
                                    styleOrder = 20;
                                    break;
                                case "http://uri.gbv.de/terminology/nld_designation_status/b753e003-c2f7-4b85-86a0-304180939e88":
                                    layerName = "baudenkmal_einzel";
                                    style = "buk_baudenkmal_teil_gruppe_tba";
                                    styleOrder = 14;
                                    break;
                            }
                            break;
                        case "http://uri.gbv.de/terminology/nld_object_category/83bd8517-35f7-4795-b842-629739807bfb":
                            switch (values.currentStatusURI) {
                                case "http://uri.gbv.de/terminology/nld_designation_status/ae4e4c47-5d6a-43c1-b048-bf02c892a249":
                                    layerName = "baudenkmal_einzel";
                                    style = "buk_baudenkmal_einzel_ff";
                                    styleOrder = 3;
                                    break;
                                case "http://uri.gbv.de/terminology/nld_designation_status/e5993e74-7f1f-4183-933e-1a1303e1f9cf":
                                    layerName = "baudenkmal_einzel";
                                    style = "buk_baudenkmal_teil_baudenkmal_ff";
                                    styleOrder = 17;
                                    break;
                                case "http://uri.gbv.de/terminology/nld_designation_status/b753e003-c2f7-4b85-86a0-304180939e88":
                                    layerName = "baudenkmal_einzel";
                                    style = "buk_baudenkmal_teil_gruppe_ff";
                                    styleOrder = 11;
                                    break;
                            }
                            break;
                        case "http://uri.gbv.de/terminology/nld_object_category/ca9ed141-9abd-4b23-9eb2-e13f8ef05bbe":
                            switch (values.currentStatusURI) {
                                case "http://uri.gbv.de/terminology/nld_designation_status/ae4e4c47-5d6a-43c1-b048-bf02c892a249":
                                    layerName = "baudenkmal_einzel";
                                    style = "buk_baudenkmal_einzel_gw";
                                    styleOrder = 4;
                                    break;
                                case "http://uri.gbv.de/terminology/nld_designation_status/e5993e74-7f1f-4183-933e-1a1303e1f9cf":
                                    layerName = "baudenkmal_einzel";
                                    style = "buk_baudenkmal_teil_baudenkmal_gw";
                                    styleOrder = 18;
                                    break;
                                case "http://uri.gbv.de/terminology/nld_designation_status/b753e003-c2f7-4b85-86a0-304180939e88":
                                    layerName = "baudenkmal_einzel";
                                    style = "buk_baudenkmal_teil_gruppe_gw";
                                    styleOrder = 12;
                                    break;
                            }
                            break;
                        case "http://uri.gbv.de/terminology/nld_object_category/c9a1a284-c2b8-4572-b92e-48184c72df55":
                            switch (values.currentStatusURI) {
                                case "http://uri.gbv.de/terminology/nld_designation_status/ae4e4c47-5d6a-43c1-b048-bf02c892a249":
                                    layerName = "baudenkmal_einzel";
                                    style = "buk_baudenkmal_einzel_gr";
                                    styleOrder = 5;
                                    break;
                                case "http://uri.gbv.de/terminology/nld_designation_status/e5993e74-7f1f-4183-933e-1a1303e1f9cf":
                                    layerName = "baudenkmal_einzel";
                                    style = "buk_baudenkmal_teil_baudenkmal_gr";
                                    styleOrder = 19;
                                    break;
                                case "http://uri.gbv.de/terminology/nld_designation_status/b753e003-c2f7-4b85-86a0-304180939e88":
                                    layerName = "baudenkmal_einzel";
                                    style = "buk_baudenkmal_teil_gruppe_gr";
                                    styleOrder = 13;
                                    break;
                            }
                            break;
                        case "http://uri.gbv.de/terminology/nld_object_category/bb29767e-5d63-4372-9543-7d231e363838":
                            switch (values.currentStatusURI) {
                                case "http://uri.gbv.de/terminology/nld_designation_status/ae4e4c47-5d6a-43c1-b048-bf02c892a249":
                                    layerName = "baudenkmal_einzel";
                                    style = "buk_baudenkmal_einzel_bs";
                                    styleOrder = 7;
                                    break;
                                case "http://uri.gbv.de/terminology/nld_designation_status/e5993e74-7f1f-4183-933e-1a1303e1f9cf":
                                    layerName = "baudenkmal_einzel";
                                    style = "buk_baudenkmal_teil_baudenkmal_bs";
                                    styleOrder = 21;
                                    break;
                                case "http://uri.gbv.de/terminology/nld_designation_status/b753e003-c2f7-4b85-86a0-304180939e88":
                                    layerName = "baudenkmal_einzel";
                                    style = "buk_baudenkmal_teil_gruppe_bs";
                                    styleOrder = 15;
                                    break;
                            }
                            break;
                    }
                    switch (values.currentStatusURI) {
                        case "http://uri.gbv.de/terminology/nld_designation_status/89db8787-f763-4791-af9f-93dd1f3ebd08":
                            layerName = "nichtdenkmal_ehem_denkmal";
                            style = "buk_ehem_denkmal";
                            styleOrder = 2;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/4cae2115-8bda-414a-8911-39133d76d78e":
                            layerName = "nichtdenkmal_ehem_denkmal";
                            style = "buk_nichtdenkmal";
                            styleOrder = 3;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/480cbf06-8b01-475d-a20b-f790b5cf3a33":
                            layerName = "baudenkmal_einzel";
                            style = "buk_baudenkmal_denkmal";
                            styleOrder = 22;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/54d1f9d4-d055-4fcb-8fe9-bd31dd520e94":
                            layerName = "baudenkmal_gruppe";
                            style = "buk_baudenkmal_gruppe";
                            styleOrder = 2;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/9eaf7321-0cfa-45e1-a53f-3a4fd976100b":
                            layerName = "infoobjekt";
                            style = "infoobjekt";
                            styleOrder = 2;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/ce737365-5223-45f0-8e71-027feb8827b1":
                            layerName = "denkmal_in_ausweisung_prueffall";
                            style = "buk_denkmal_in_ausweisung_einzel";
                            styleOrder = 7;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/4cff406c-35ff-4f73-bcfa-2f320a2394d4":
                            layerName = "denkmal_in_ausweisung_prueffall";
                            style = "buk_denkmal_in_ausweisung_gruppe";
                            styleOrder = 9;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/ddd8b550-b115-4afc-80d6-04351fd682df":
                            layerName = "denkmal_in_ausweisung_prueffall";
                            style = "buk_denkmal_in_ausweisung_teil_baudenkmal";
                            styleOrder = 10;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/2c8ceac4-62e9-4b38-8487-c4cceecb389d":
                            layerName = "denkmal_in_ausweisung_prueffall";
                            style = "buk_denkmal_in_ausweisung_teil_gruppe";
                            styleOrder = 8;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/048295c7-3191-4b7c-9771-f3c45637c03b":
                            layerName = "denkmal_in_ausweisung_prueffall";
                            style = "buk_prueffall";
                            styleOrder = 6;
                            break;
                    }
                    break;
                case "Erdgeschichte":
                    switch (values.currentStatusURI) {
                        case "http://uri.gbv.de/terminology/nld_designation_status/6ce0a9b7-532a-4c50-8529-2ad74e7cdb99":
                            layerName = "denkmal_in_ausweisung_prueffall";
                            style = "erdgesch_denkmal_in_ausweisung";
                            styleOrder = 11;
                            break;
                        case "http://uri.gbv.de/terminology/nld_designation_status/f3bf4ce6-6d48-4a56-9ff7-8346d2ee1393":
                            layerName = "erdgeschichte";
                            style = "erdgeschichte";
                            styleOrder = 0;
                            break;
                    }
                    break;
                case "Kulturlandschaftselemente":
                    layerName = "infoobjekt";
                    style = "kultlandschaft";
                    styleOrder = 1;
                    break;
            }
            break;
        case "flaeche":
            switch (values.areaTypeURI) {
                case "http://uri.gbv.de/terminology/nld_area_type/e7e42a17-b6d1-4ad5-a9c1-0b33ad65ff09":
                    layerName = "welterbe";
                    style = "welterbe_kernzone";
                    styleOrder = 2;
                    break;
                case "http://uri.gbv.de/terminology/nld_area_type/0d4cc26c-0a0d-4133-8ad5-bb73062a1206":
                    layerName = "welterbe";
                    style = "welterbe_pufferzone";
                    styleOrder = 1;
                    break;
                case "http://uri.gbv.de/terminology/nld_area_type/63f7be4e-84a4-4dc7-9e44-ca680ad8e55a":
                    layerName = "welterbe";
                    style = "welterbe_unter_tage";
                    styleOrder = 3;
                    break;
                case "http://uri.gbv.de/terminology/nld_area_type/755fc3ab-5c2f-441a-b187-6c97292dac5f":
                    layerName = "stadt_ortskern";
                    style = "stadt_ortskern";
                    styleOrder = 0;
                    break;
                case "http://uri.gbv.de/terminology/nld_area_type/82f338a0-f29c-4ed2-a237-8ff2aaab3c96":
                    layerName = "verlustflaeche";
                    style = "verlustflaeche";
                    styleOrder = 0;
                    break;
                case "http://uri.gbv.de/terminology/nld_area_type/905b2083-846e-4fef-ba0f-302592478921":
                    layerName = "auftragungsflaeche";
                    style = "auftragungsflaeche";
                    styleOrder = 0;
                    break;
                case "http://uri.gbv.de/terminology/nld_area_type/ccfbf900-5dbb-42d0-b5eb-cf4638ae85df":
                    layerName = "grabungsschutzgebiet";
                    style = "grabungsschutzgebiet";
                    styleOrder = 0;
                    break;
            }
            break;
        case "massnahme":
            if (values.poolName === "Archäologie") {
                layerName = "massnahme";
                style = "massnahme";
                styleOrder = 0;
            }
            break;
    }

    return { layerName: layerName, style: style, styleOrder: styleOrder };
}


function getEditLayer(layer) {
    let editLayer = undefined;

    switch (layer) {
        case "baudenkmal_einzel":
            editLayer = "baudenkmal_einzel";
            break;
        case "baudenkmal_gruppe":
            editLayer = "baudenkmal_gruppe";
            break;
        case "denkmal_in_ausweisung_prueffall":
            editLayer = "denkmal_in_ausweisung_prueffall";
            break;
        case "nichtdenkmal_ehem_denkmal":
            editLayer = "nichtdenkmal_ehem_denkmal";
            break;
        case "bodendenkmal_fundstelle":
            editLayer = "bodendenkmal_fundstelle";
            break;
        case "infoobjekt":
            editLayer = "infoobjekt";
            break;
        case "welterbe":
            editLayer = "welterbe";
            break;
        case "stadt_ortskern":
            editLayer = "stadt_ortskern";
            break;
        case "verlustflaeche":
            editLayer = "verlustflaeche";
            break;
        case "auftragungsflaeche":
            editLayer = "auftragungsflaeche";
            break;
        case "grabungsschutzgebiet":
            editLayer = "grabungsschutzgebiet";
            break;
        case "massnahme":
            editLayer = "massnahme";
            break;
        case "erdgeschichte":
            editLayer = "erdgeschichte";
            break;
        default:
            break;
    }

    return editLayer;
}

async function main() {

    const authConfig = {
        clientID: '', // Replace with your actual client ID
        clientSecret: '', // Replace with your actual client secret
        username: '', // Replace with your actual username
        password: '' // Replace with your actual password
    };

    const hostName = ''; // Replace with your actual host name

    const exampleObject = {
        objectType: '',// Replace with your actual object type
        objectID: 111 // Replace with your actual object ID
    };

    const responseData = await fetchObjectData(hostName, authConfig, exampleObject);
    const objectData = responseData.objects?.[0];

    if (objectData === undefined) {
        throw new Error(`No object found for id ${exampleObject.objectID}`);
    }

    const record = objectData[exampleObject.objectType];

    let values = {
        objectType: objectData._objecttype,
        poolName: record._pool._path[2].pool.name['de-DE']
    };

    values.currentStatusURI = getCurrentStatusURI(record);
    values.objectCategoryURI = getObjectCategoryURI(record);
    values.areaTypeURI = getAreaTypeURI(record);
    values.layerAndStyle = getLayerAndStyle(values);
    values.editLayer = getEditLayer(values.layerAndStyle.layerName);
    
    console.log('Values:', JSON.stringify(values, null, 2));

}

main().catch(() => process.exit(1));
