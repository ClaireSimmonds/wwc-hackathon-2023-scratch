const axios = require('axios').default;

const providerBaseURL = axios.create({
    baseURL: "https://data.cms.gov/provider-data/api"
});

const providerDatasetID = "4pq5-n9py";

async function getDistributionIdentifier(datasetID) {
    let distributionData;
    try {
        const response = await providerBaseURL.get("/1/metastore/schemas/dataset/items/" + datasetID, {
            params: { show_reference_ids: true },
        });
        distributionData = response.data?.distribution || [];
    } catch (err) {
        console.error(err);
    }
    
    if (distributionData.length > 0) {
        return distributionData[0]?.identifier;
    }
}

async function getProviderResults(queryString) {
    let providers;
    try {
        const response = await providerBaseURL.get("/1/datastore/sql", {
            params: {
                query: queryString,
                show_db_columns: true
            }
        });
        providers = response.data;
    } catch (err) {
        console.error(err);
    }

    return providers;
}

function buildQueryFromFilters(distributionID, filters={}, limit=10, offset=0) {
    let query = "[SELECT * FROM " + distributionID + "]";

    if (Object.keys(filters).length > 0) {
        query += generateWhereClause(filters);
    }

    query += generateLimitClause(limit, offset);
    return query;
}

function generateWhereClause(filters) {
    let where_clause = "[WHERE ";

    if (filters.hasOwnProperty("zip_code")) {
        where_clause += 'zip_code = "' + filters.zip_code + '"';
    }

    if (filters.hasOwnProperty("overall_rating")) {
        where_clause += ' AND overall_rating = "' + filters.overall_rating + '"';
    }

    if (filters.hasOwnProperty("provider_resides_in_hospital")) {
        where_clause += ' AND provider_resides_in_hospital = "' + filters.provider_resides_in_hospital + '"';
    }

    if (filters.hasOwnProperty("continuing_care_retirement_community")) {
        where_clause += ' AND continuing_care_retirement_community = "' + filters.continuing_care_retirement_community + '"';
    }

    if (filters.hasOwnProperty("provider_type")) {
        where_clause += ' AND provider_type = "' + filters.provider_type + '"';
    }

    where_clause += "]";
    return where_clause;
}

function generateLimitClause(limit, offset) {
    return "[LIMIT " + limit + " OFFSET " + offset + "]";
}

async function main() {
    const distributionID = await getDistributionIdentifier(providerDatasetID);
    const filters = {
        //zip_code: "xxxxx",
        //overall_rating: "x",
        //provider_resides_in_hospital: "N",
        //continuing_care_retirement_community: "N",
        //provider_type: "Medicare and Medicaid" //valid options include: Medicare, Medicaid, Medicare and Medicaid
    }

    const query = buildQueryFromFilters(distributionID, filters)
    const providers = await getProviderResults(query);
    console.log(providers);
    console.log(query);
    return providers
}

if (require.main === module) {
    main().then(() => process.exit());
}