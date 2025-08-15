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
          tags: ['Authentification'],
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
              },
            },
          },
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
      '/users/logout': {
        post: {
          summary: 'Déconnexion de l\'utilisateur',
          description: 'Permet à l\'utilisateur de se déconnecter en détruisant sa session ou son token d\'authentification.',
          security: [
            {
              BearerAuth: [],
            },
          ],
          tags: ['Authentification'],
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
          responses: {
            200: {
              description: 'Utilisateur déconnecté avec succès',
            },
            401: {
              description: 'Utilisateur non authentifié',
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
      '/users/ldap/{ldap}': {
        get: {
          summary: 'Obtenir un utilisateur',
          description: 'Récupère un utilisateur en fonction de son LDAP.',
          security: [
            {
              BearerAuth: [],
            },
          ],
          tags: ['Users'],
          parameters: [
            {
              in: 'path',
              name: 'ldap',
              required: true,
              description: 'LDAP de l\'utilisateur',
              schema: {
                type: 'string',
                example: 'ken',
              },
            },
          ],
          responses: {
            200: {
              description: 'Utilisateur récupéré avec succès',
            },
            404: {
              description: 'Utilisateur non trouvé',
            },
          },
        },
      },
      '/users/username/{username}': {
        get: {
          summary: 'Obtenir un utilisateur par son nom d\'utilisateur',
          description: 'Récupère un utilisateur en fonction de son nom d\'utilisateur.',
          security: [
            {
              BearerAuth: [],
            },
          ],
          tags: ['Users'],
          parameters: [
            {
              in: 'path',
              name: 'username',
              required: true,
              description: 'Nom d\'utilisateur de l\'utilisateur',
              schema: {
                type: 'string',
                example: 'ken',
              },
            },
          ],
          responses: {
            200: {
              description: 'Utilisateur récupéré avec succès',
            },
            404: {
              description: 'Utilisateur non trouvé',
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
          tags: ['Users'],
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
      '/users/update-user': {
        put: {
          summary: 'Mettre à jour un utilisateur',
          description: 'Permet de modifier les informations d\'un utilisateur existant.',
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
                      example: '1',
                      description: 'Identifiant LDAP de l\'utilisateur',
                    },
                    updateData: {
                      type: 'object',
                      properties: {
                        firstname: { type: 'string', example: 'Ken' },
                        lastname: { type: 'string', example: 'Shiro' },
                        email: { type: 'string', example: 'ken@example.com' },
                        picture: { type: 'string', example: 'https://randomuser.me/api/port' },
                        login: {
                          type: 'object',
                          properties: {
                            username: { type: 'string', example: 'ken' },
                            password: { type: 'string', example: 'ler123' },
                          },
                        },
                        roles: {type: 'array', items: { type: 'string', enum: ['ADMIN', 'USER'] }, example: ['USER']},
                        numberOfBreakFastOrganised: { type: 'integer', example: 2 },
                        nextOrganizedBreakfastDate: { type: 'string', format: 'date-time', example: '2024-03-26T00:00:00+01:00' },
                      },
                      description: 'Données à mettre à jour',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Utilisateur mis à jour avec succès',
            },
            400: {
              description: 'Requête invalide (données manquantes)',
            },
            500: {
              description: 'Erreur interne du serveur',
            },
          },
        },
      },
      '/users/validate-breakfast': {
        put: {
          summary: 'Valider un petit déjeuner',
          description: 'Valide l’organisation d’un petit déjeuner pour un utilisateur en fonction de son LDAP.',
          tags: ['Users'],
          security: [
            {
              BearerAuth: [],
            },
          ],
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
                      example: 'ken',
                      description: 'Identifiant LDAP de l\'utilisateur',
                    },
                    date: {
                      type: 'string',
                      format: 'date-time',
                      example: '2025-04-22T08:00:00+01:00',
                      description: 'Date du petit déjeuner à valider',
                    },
                  },
                  required: ['ldap', 'date'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Petit-déjeuner validé',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Petit-déjeuner validé',
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: 'Erreur lors de la validation du petit-déjeuner',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Erreur lors de la validation du petit-déjeuner',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/users/add-next-organized-breakfast-date': {
        put: {
          summary: 'Ajouter ou modifier la prochaine date de petit-déjeuner organisé',
          description: 'Permet de définir ou mettre à jour la prochaine date de petit-déjeuner organisé pour un utilisateur identifié par son LDAP.',
          tags: ['Users'],
          security: [
            {
              BearerAuth: [],
            },
          ],
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
                      example: 'ken',
                      description: 'Identifiant LDAP de l\'utilisateur',
                    },
                    date: {
                      type: 'string',
                      format: 'date-time',
                      example: '2025-09-15T08:00:00+01:00',
                      description: 'Nouvelle date du petit-déjeuner organisé',
                    },
                  },
                  required: ['ldap', 'date'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Date de petit-déjeuner mise à jour avec succès',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Date mise à jour avec succès',
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Données invalides ou manquantes',
            },
            500: {
              description: 'Erreur interne du serveur',
            },
          },
        },
      },
      '/users/remove-next-organized-breakfast-date': {
        put: {
          summary: 'Supprimer la prochaine date de petit-déjeuner organisé',
          description: 'Met à null le champ nextOrganizedBreakfastDate pour un utilisateur identifié par son LDAP.',
          tags: ['Users'],
          security: [
            {
              BearerAuth: [],
            },
          ],
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
                      example: 'ken',
                      description: 'Identifiant LDAP de l\'utilisateur',
                    },
                  },
                  required: ['ldap'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Date de petit-déjeuner supprimée avec succès',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Date supprimée avec succès',
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'LDAP manquant ou invalide',
            },
            500: {
              description: 'Erreur interne du serveur',
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
