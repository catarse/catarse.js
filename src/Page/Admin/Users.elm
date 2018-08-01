module Main exposing (..)

import Html exposing (Html, img, form, div, input, text, a, button)
import Html.Attributes exposing (class, id, src, href, type_, target, attribute, value, placeholder)
import Http
import Json.Decode as Decode


main =
    Html.program { init = init, view = view, update = update, subscriptions = subscription }


type alias User =
    { email : String
    , name : String
    , id : Int
    }


type alias Model =
    { search : String
    , items : List User
    }


init : ( Model, Cmd Msg )
init =
    let
        model =
            Model "" []
    in
        ( model, fetchResults model )


update : Msg -> Model -> Model
update msg model =
    model


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


view : Model -> Html msg
view model =
    div []
        [ viewFilter model.search
        , div [ class "w-section section" ]
            [ div [ class "w-container" ]
                [ viewSearchCount
                , div [ class "w-container", id "admin-contributions-list" ]
                    [ viewAdminItem ]
                ]
            ]
        ]


viewFilter : String -> Html msg
viewFilter searchTerm =
    div [ class "w-section page-header", id "admin-contributions-filter" ]
        [ div [ class "w-container" ]
            [ div [ class "fontsize-larger u-text-center u-marginbottom-30" ]
                [ text "Usuários" ]
            , div [ class "w-form" ]
                [ form [ attribute "_lpchecked" "1" ]
                    [ div [ class "w-row" ]
                        [ div [ class "w-col w-col-8" ]
                            [ input [ class "w-input text-field positive medium", placeholder "Busque por nome, e-mail, Ids do usuário...", type_ "text", value searchTerm ]
                                []
                            ]
                        , div [ class "w-col w-col-4" ]
                            [ input [ class "btn btn-large u-marginbottom-10", id "filter-btn", type_ "submit", value "Buscar" ]
                                []
                            ]
                        ]
                    , div [ class "u-marginbottom-20 w-row" ]
                        [ button [ class "w-col w-col-12 fontsize-smallest link-hidden-light", attribute "style" "background: none; border: none; outline: none; text-align: left;", type_ "button" ]
                            [ text "Filtros avançados >" ]
                        ]
                    ]
                ]
            ]
        ]


viewSearchCount : Html msg
viewSearchCount =
    div [ class "w-row u-marginbottom-20" ]
        [ div [ class "w-col w-col-12" ]
            [ div [ class "fontsize-base" ]
                [ div [ class "w-row" ]
                    [ div [ class "w-col w-col-2" ]
                        [ div [ class "fontweight-semibold" ]
                            [ text "678843" ]
                        , text "usuários encontrados"
                        ]
                    ]
                ]
            ]
        ]


viewAdminItem : Html msg
viewAdminItem =
    div [ class "w-clearfix card u-radius u-marginbottom-20 results-admin-items" ]
        [ div [ class "w-row" ]
            [ div [ class "w-col w-col-4" ]
                [ div [ class "w-row admin-user" ]
                    [ div [ class "w-col w-col-3 w-col-small-3 u-marginbottom-10" ]
                        [ img [ class "user-avatar", src "/assets/catarse_bootstrap/user.jpg" ]
                            []
                        ]
                    , div [ class "w-col w-col-9 w-col-small-9" ]
                        [ div [ class "fontweight-semibold fontsize-smaller lineheight-tighter u-marginbottom-10" ]
                            [ a [ class "alt-link", href "/users/686575/edit", target "_blank" ]
                                [ text "thiago+base@catarse.me" ]
                            ]
                        , div [ class "fontsize-smallest" ]
                            [ text "Usuário: 686575" ]
                        , div [ class "fontsize-smallest fontcolor-secondary" ]
                            [ text "Email: thiago+base@catarse.me" ]
                        ]
                    ]
                ]
            ]
        , button [ class "w-inline-block arrow-admin fa fa-chevron-down fontcolor-secondary" ]
            []
        ]


fetchResults : Model -> Cmd Msg
fetchResults model =
    let
        url =
            "http://localhost:3010/users?order=id.desc&full_text_index=" ++ model.search
    in
        Http.send Fetch (Http.get url decodeResponse)


decodeResponse : Decode.Decoder String
decodeResponse =
    Decode.at [ "data" ] Decode.string
