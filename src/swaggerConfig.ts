import { SwaggerOptions } from "swagger-ui-express";

const swaggerConfig: SwaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "Documentation de l'API avec Swagger",
    },
    paths: {
      '/csrf-token': {
        get: {
          summary: 'Obtenir le token CSRF',
          description: 'Permet d\'obtenir un token CSRF pour les requêtes sécurisées.',
          responses: {
            200: {
              description: 'Token CSRF retourné avec succès',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      csrfToken: {
                        type: 'string',
                        example: 'ton_token_csrf_ici',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/users/login': {
        post: {
          summary: 'Connexion de l\'utilisateur',
          description: 'Permet à l\'utilisateur de se connecter.',
          parameters: [
            {
              in: 'header',
              name: 'X-CSRF-Token',
              required: true,
              description: 'Token CSRF pour la sécurité',
              schema: {
                type: 'string',
                example: 'ton_token_csrf_ici',
              },
            },
          ],
          responses: {
            200: {
              description: 'Utilisateur connecté avec succès',
            },
            401: {
              description: 'Échec de l\'authentification',
            },
          },
        },
      },
      '/users': {
        get: {
          summary: 'Liste des utilisateurs',
          security: [
            {
              BearerAuth: [],
            },
          ],
          tags: ['Users'],
          responses: {
            200: {
              description: 'Liste récupérée avec succès',
            },
            401: {
              description: 'Non autorisé',
            },
          },
        },
      },
      '/users/add-user': {
        post: {
          summary: 'Ajouter un utilisateur',
          security: [
            {
              BearerAuth: [],
            },
          ],
          tags: ['Users'],
          parameters: [
            {
              in: 'header',
              name: 'X-CSRF-Token',
              required: true,
              description: 'Token CSRF pour protéger contre les attaques CSRF',
              schema: {
                type: 'string',
                example: 'ton_token_csrf_ici',
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    firstname: {
                      type: 'string',
                      example: 'Ken',
                    },
                    lastname: {
                      type: 'string',
                      example: 'Le Survivant',
                    },
                    email: {
                      type: 'string',
                      example: 'ken@example.com',
                    },
                    login: {
                      type: 'object',
                      properties: {
                        username: {
                          type: 'string',
                          example: 'ken',
                        },
                        password: {
                          type: 'string',
                          example: 'ler123',
                        },
                      },
                    },
                    picture: {
                      type: 'string',
                      example: 'https://randomuser.me/api/portraits/women/90.jpg',
                    },
                    roles: {
                      type: 'array',
                      items: {
                        type: 'string',
                        enum: ['ADMIN', 'USER'],
                      },
                      example: ['USER'],
                    },
                    numberOfBreakFastOrganised: {
                      type: 'integer',
                      example: 2,
                    },
                    nextOrganizedBreakfastDate: {
                      type: 'string',
                      format: 'date-time',
                      example: '2024-03-26T00:00:00+01:00',
                    },
                    creationDate: {
                      type: 'string',
                      format: 'date',
                      example: '2023-02-01',
                    },
                    ldap: {
                      type: 'string',
                      example: '1',
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Utilisateur ajouté avec succès',
            },
            400: {
              description: 'Données invalides',
            },
            500: {
              description: 'Erreur interne du serveur',
            },
          },
        },
      },
      '/users/delete-user': {
        delete: {
          summary: 'Supprimer un utilisateur',
          description: 'Supprime un utilisateur en fonction de son LDAP.',
          parameters: [
            {
              in: 'header',
              name: 'X-CSRF-Token',
              required: true,
              description: 'Token CSRF pour la sécurité',
              schema: {
                type: 'string',
                example: 'ton_token_csrf_ici',
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ldap: {
                      type: 'string',
                      example: 'sanni',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "L'utilisateur a été supprimé avec succès",
            },
            400: {
              description: 'Le champ "ldap" est requis',
            },
            403: {
              description: 'CSRF Token invalide',
            },
            500: {
              description: "Erreur interne du serveur",
            },
          },
        },
      },

    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      parameters: {
        'X-CSRF-Token': {
          name: 'X-CSRF-Token',
          in: 'header',
          required: true,
          schema: {
            type: 'string',
            description: 'Token CSRF pour protéger contre les attaques CSRF',
          },
        },
      },
    },
    security: [],
  },
  apis: ["./src/routes/**/*.ts"],
};

export default swaggerConfig;
