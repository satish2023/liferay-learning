import {useEffect, useState} from 'react';

function App() {
    const [allRoles, setAllRoles] = useState([]);
    const [userRoles, setUserRoles] = useState([]);

    const [products, setProducts] = useState([]);

    const [rolesLoading, setRolesLoading] = useState(true);
    const [apiLoading, setApiLoading] = useState(true);

    const [rolesError, setRolesError] = useState('');
    const [apiError, setApiError] = useState('');

    // =========================================================
    // 1. LOAD LIFERAY ROLES
    // =========================================================

    useEffect(() => {
        async function loadRoles() {
            try {
                const rolesResponse = await Liferay.Util.fetch(
                    '/o/headless-admin-user/v1.0/roles?pageSize=100'
                );

                if (!rolesResponse.ok) {
                    throw new Error(
                        `Roles API error: ${rolesResponse.status}`
                    );
                }

                const rolesData = await rolesResponse.json();

                console.log('ALL LIFERAY ROLES:', rolesData);

                /*
                 * Liferay Headless API normally returns:
                 *
                 * {
                 *     items: [...]
                 * }
                 *
                 * Make sure we always store an array.
                 */
                const roles = Array.isArray(rolesData?.items)
                    ? rolesData.items
                    : [];

                setAllRoles(roles);

                // -------------------------------------------------
                // CURRENT USER
                // -------------------------------------------------

                const currentUser =
                    typeof Liferay !== 'undefined' &&
                    Liferay.ThemeDisplay
                        ? Liferay.ThemeDisplay.getUserId()
                        : null;

                console.log(
                    'Current Liferay user ID:',
                    currentUser
                );

                // -------------------------------------------------
                // USER ROLES
                // -------------------------------------------------
                //
                // Keeping this empty for now because your current
                // environment does not expose the user role API
                // through the endpoint you were using.
                //
                // When you have the user-role endpoint available,
                // populate this array.
                //

                setUserRoles([]);

                if (
                    typeof Liferay !== 'undefined' &&
                    Liferay.ThemeDisplay
                ) {
                    console.log(
                        'Liferay ThemeDisplay:',
                        Liferay.ThemeDisplay
                    );
                }
            }
            catch (error) {
                console.error(
                    'Role loading error:',
                    error
                );

                setRolesError(
                    error?.message ||
                    'Unable to load Liferay roles'
                );

                setAllRoles([]);
            }
            finally {
                setRolesLoading(false);
            }
        }

        loadRoles();
    }, []);

    // =========================================================
    // 2. LOAD SPRING BOOT PRODUCTS
    // =========================================================

    useEffect(() => {
        async function loadSpringApi() {
            try {
                /*
                 * The request goes through Liferay.
                 *
                 * Your Liferay REST Builder endpoint:
                 *
                 * /o/my-products/v1.0/products
                 *
                 * Liferay then calls your Spring Boot API.
                 */
                const response = await Liferay.Util.fetch(
                    '/o/my-products/v1.0/products',
                    {
                        method: 'GET',

                        headers: {
                            Accept: 'application/json'
                        }
                    }
                );

                console.log(
                    'Spring API status:',
                    response.status
                );

                /*
                 * Read the response only once.
                 */
                const data = await response.json();

                console.log(
                    'Spring API raw response:',
                    data
                );

                // -------------------------------------------------
                // CHECK HTTP STATUS
                // -------------------------------------------------

                if (!response.ok) {
                    throw new Error(
                        data?.title ||
                        data?.message ||
                        `Spring API error: ${response.status} ${response.statusText}`
                    );
                }

                // -------------------------------------------------
                // NORMALIZE RESPONSE
                // -------------------------------------------------
                //
                // The API may return:
                //
                // 1. Array:
                //
                // [
                //     {...},
                //     {...}
                // ]
                //
                // OR
                //
                // 2. Liferay-style response:
                //
                // {
                //     "items": [...]
                // }
                //
                // OR
                //
                // 3. Another object.
                //
                // React .map() requires an array.
                //

                let productList = [];

                if (Array.isArray(data)) {
                    productList = data;
                }
                else if (Array.isArray(data?.items)) {
                    productList = data.items;
                }
                else if (Array.isArray(data?.products)) {
                    productList = data.products;
                }
                else {
                    console.warn(
                        'Spring API did not return an array:',
                        data
                    );
                }

                console.log(
                    'Normalized products:',
                    productList
                );

                setProducts(productList);
            }
            catch (error) {
                console.error(
                    'Spring API error:',
                    error
                );

                setApiError(
                    error?.message ||
                    'Unable to load products'
                );

                /*
                 * Very important:
                 *
                 * Always keep products as an array.
                 *
                 * This prevents:
                 *
                 * TypeError: products.map is not a function
                 */
                setProducts([]);
            }
            finally {
                setApiLoading(false);
            }
        }

        loadSpringApi();
    }, []);

    // =========================================================
    // LOADING
    // =========================================================

    if (rolesLoading || apiLoading) {
        return (
            <div
                style={{
                    padding: '30px',
                    fontFamily: 'Arial, sans-serif'
                }}
            >
                <h2>Loading...</h2>

                <p>
                    Loading Liferay roles and Spring Boot
                    products.
                </p>
            </div>
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <div
            style={{
                padding: '30px',
                fontFamily: 'Arial, sans-serif',
                maxWidth: '1000px',
                margin: '0 auto'
            }}
        >

            {/* =================================================
                LIFERAY ROLES
            ================================================= */}

            <h1>
                Liferay Roles
            </h1>

            {rolesError && (
                <div
                    style={{
                        backgroundColor: '#ffdddd',
                        color: '#721c24',
                        padding: '15px',
                        marginBottom: '20px',
                        borderRadius: '5px',
                        border: '1px solid #f5c6cb'
                    }}
                >
                    <strong>
                        Role Error:
                    </strong>

                    <div
                        style={{
                            marginTop: '5px'
                        }}
                    >
                        {rolesError}
                    </div>
                </div>
            )}

            {!rolesError &&
                allRoles.length === 0 && (
                    <p>
                        No roles found.
                    </p>
                )}

            {!rolesError &&
                Array.isArray(allRoles) &&
                allRoles.map((role) => {

                    const hasRole =
                        Array.isArray(userRoles) &&
                        userRoles.some(
                            (userRole) =>
                                userRole.id === role.id
                        );

                    return (
                        <div
                            key={role.id}
                            style={{
                                padding: '12px',
                                marginBottom: '6px',
                                borderRadius: '5px',

                                backgroundColor:
                                    hasRole
                                        ? '#d4edda'
                                        : '#eeeeee',

                                color:
                                    hasRole
                                        ? '#155724'
                                        : '#333',

                                fontWeight:
                                    hasRole
                                        ? 'bold'
                                        : 'normal',

                                border:
                                    hasRole
                                        ? '2px solid #28a745'
                                        : '1px solid #ddd'
                            }}
                        >

                            <span>
                                {role.name}
                            </span>

                            {hasRole && (
                                <span
                                    style={{
                                        marginLeft: '12px',
                                        color: '#155724'
                                    }}
                                >
                                    ✓ YOUR ROLE
                                </span>
                            )}

                        </div>
                    );
                })}

            {/* =================================================
                SEPARATOR
            ================================================= */}

            <hr
                style={{
                    margin: '40px 0'
                }}
            />

            {/* =================================================
                SPRING BOOT PRODUCTS
            ================================================= */}

            <h1>
                Spring Boot API
            </h1>

            {apiError && (
                <div
                    style={{
                        backgroundColor: '#ffdddd',
                        color: '#721c24',
                        padding: '15px',
                        marginBottom: '20px',
                        borderRadius: '5px',
                        border: '1px solid #f5c6cb'
                    }}
                >
                    <strong>
                        Spring API Error:
                    </strong>

                    <div
                        style={{
                            marginTop: '5px'
                        }}
                    >
                        {apiError}
                    </div>
                </div>
            )}

            {!apiError &&
                products.length === 0 && (
                    <div
                        style={{
                            padding: '20px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '5px',
                            border: '1px solid #ddd'
                        }}
                    >
                        <p>
                            No products found.
                        </p>
                    </div>
                )}

            {/* =================================================
                PRODUCT LIST
            ================================================= */}

            {Array.isArray(products) &&
                products.map((product) => (
                    <div
                        key={product.id}
                        style={{
                            padding: '20px',
                            marginBottom: '15px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            backgroundColor: '#f8f9fa',
                            boxShadow:
                                '0 2px 5px rgba(0,0,0,0.05)'
                        }}
                    >

                        <h3
                            style={{
                                marginTop: 0,
                                marginBottom: '10px'
                            }}
                        >
                            {product.name ||
                                'Unnamed Product'}
                        </h3>

                        <p>
                            <strong>
                                Product ID:
                            </strong>{' '}
                            {product.id}
                        </p>

                        <p>
                            <strong>
                                Price:
                            </strong>{' '}
                            ₹{product.price}
                        </p>

                    </div>
                ))}

        </div>
    );
}

export default App;
